
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Rsvg = imports.gi.Rsvg;

const CompassCanvas = new Lang.Class({
	Name: 'CompassCanvas',

	_loadSVG: function() {
		let svgInStream = Gio.resources_open_stream("/ca/reyad/Compass/compass.svg", Gio.ResourceLookupFlags.NONE);
		let handle = Rsvg.Handle.new_from_stream_sync(svgInStream, null, Rsvg.HandleFlags.FLAGS_NONE, null);
	
		let rsvgPosResult = handle.get_position_sub("#needle");
		let rsvgDimResult = handle.get_dimensions_sub("#needle");
		if (rsvgPosResult[0] && rsvgDimResult[0]) {
			this._needlePosition = rsvgPosResult[1];
			this._needleDimensions = rsvgDimResult[1];
		}else{
			log("Failed to find positon or dimensions of compass needle");
		}

		let a = handle.get_pixbuf_sub("#bg");
		let b = handle.get_pixbuf_sub("#needle");
		this._bgPixbuf = a;
		this._needlePixbuf = b;

		if(!handle.close()) {
			log("Failed to close rsvg handle");
		}

		if(!svgInStream.close(null)) {
			log("Failed to close gio resource stream");
		}

		log("Finished loading svg...");
	},

	_init: function() {
		this._loadSVG();
		this._angle = 0;
	},

	setAngleDegrees: function(deg) {
		let rad = deg * Math.PI / 180.0;
		log("Degrees: " + deg);
		this._angle = rad;
	},

	renderCairo: function(cr) {
		let bg = this._bgPixbuf.copy();
		let needle = this._needlePixbuf.copy();

		Gdk.cairo_set_source_pixbuf(cr, bg, 0, 0);
		cr.paint();
		let x = this._needlePosition.x + (this._needleDimensions.width / 2);
		let y = this._needlePosition.y + (this._needleDimensions.height / 2);

		cr.translate(x, y);
		//cr.rotate(this.angle = ((this.angle + 0.1) % (2*Math.PI)));
		//log("Angle: " + this._angle);
		cr.rotate(this._angle);
		cr.translate(-x, -y);
		Gdk.cairo_set_source_pixbuf(cr, needle, 0, 0);
		cr.paint();
	}

});


const CompassIIOSensor = new Lang.Class({
	Name: 'CompassIIOSensor',

	_setupDbusProxy: function() {
		let sensorProxyInterface = Gio.resources_lookup_data('/ca/reyad/Compass/net.hadess.SensorProxy.xml', Gio.ResourceLookupFlags.NONE).get_data();
		let IIOSensorProxy = Gio.DBusProxy.makeProxyWrapper(sensorProxyInterface.toString());
		this._iioSensorProxy = new IIOSensorProxy(Gio.DBus.system, 'net.hadess.SensorProxy', '/net/hadess/SensorProxy/Compass');

	},

	_claimCompassCB: function(result, error) {
		log("Calim Callbacked Result: " + result + " Error: " + error);
	},

	_claimCompass: function() {
		let hasCompass = this._iioSensorProxy.HasCompass;
		if (hasCompass) {
			log("Claming Compass");
			this._iioSensorProxy.ClaimCompassRemote(this._claimCompassCB.bind(this));
		}else{
			throw "No Compass found";
		}
	},

	_init: function() {
		this._setupDbusProxy();

		this._claimCompass();
	},

	getHeading: function() {
	//	log("Compass Heading: " + this._iioSensorProxy.CompassHeading);
		return this._iioSensorProxy.CompassHeading;
	}


});
