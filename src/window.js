// -*- Mode: js; indent-tabs-mode: nil; c-basic-offset: 4; tab-width: 4 -*-
//
// Copyright (c) 2013 Giovanni Campagna <scampa.giovanni@gmail.com>
//
// Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//   * Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//   * Neither the name of the GNOME Foundation nor the
//     names of its contributors may be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Rsvg = imports.gi.Rsvg;
const Lang = imports.lang;
const Params = imports.params;

const Util = imports.util;

const Compass = imports.compass;

const MainWindow = new Lang.Class({
    Name: 'MainWindow',
    Extends: Gtk.ApplicationWindow,
    Properties: { 'search-active': GObject.ParamSpec.boolean('search-active', '', '', GObject.ParamFlags.READABLE | GObject.ParamFlags.WRITABLE, false) },

    _drawCompassFrame: function(win) {
        this._compassDrawingArea.queue_draw_area(0, 0, 800, 800);
        this._compassCanvas.setAngleDegrees(this._compassIIOSensor.getHeading());

        return true;
    },

    _drawCompass: function(w, cr) {
        this._compassCanvas.renderCairo(cr);

        return false;
    },

    _init: function(params) {
        params = Params.fill(params, { title: GLib.get_application_name(),
                                       default_width: 640,
                                       default_height: 480 });
        this.parent(params);

        this._searchActive = false;

        Util.initActions(this,
                         [{ name: 'new',
                             activate: this._new },
                          { name: 'about',
                            activate: this._about }]);

        let builder = new Gtk.Builder();
        builder.add_from_resource('/ca/reyad/Compass/main.ui');

        this.set_titlebar(builder.get_object('main-header'));

        let grid = builder.get_object('main-grid');
        
        this._compassCanvas = new Compass.CompassCanvas();
        this._compassDrawingArea = new Gtk.DrawingArea();
        this._compassDrawingArea.set_size_request(800, 800);
        this._compassDrawingArea.connect('draw', this._drawCompass.bind(this));
        grid.add(this._compassDrawingArea);

        this._compassIIOSensor = new Compass.CompassIIOSensor();
        this._compassIIOSensor.getHeading();

        this.add(grid);
        grid.show_all();

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000/60, this._drawCompassFrame.bind(this));

        // Due to limitations of gobject-introspection wrt GdkEvent and GdkEventKey,
        // this needs to be a signal handler
        this.connect('key-press-event', Lang.bind(this, this._handleKeyPress));
    },

    _handleKeyPress: function(self, event) {

    },

    _new: function() {
        log(_("New something"));
    },

    _about: function() {
        let aboutDialog = new Gtk.AboutDialog(
            { authors: [ 'Giovanni Campagna <gcampagna@src.gnome.org>' ],
              translator_credits: _("translator-credits"),
              program_name: _("Compass"),
              comments: _("Demo JS Application and template"),
              copyright: 'Copyright 2013 The gjs developers',
              license_type: Gtk.License.GPL_2_0,
              logo_icon_name: 'com.example.Gtk.JSApplication',
              version: pkg.version,
              website: 'http://www.example.com/gtk-js-app/',
              wrap_license: true,
              modal: true,
              transient_for: this
            });

        aboutDialog.show();
        aboutDialog.connect('response', function() {
            aboutDialog.destroy();
        });
    },
});
