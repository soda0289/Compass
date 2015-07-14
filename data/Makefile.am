SUBDIRS = icons

app_resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir) --generate-dependencies $(srcdir)/ca.reyad.Compass.data.gresource.xml)
ca.reyad.Compass.data.gresource: ca.reyad.Compass.data.gresource.xml $(app_resource_files)
	$(AM_V_GEN) $(GLIB_COMPILE_RESOURCES) --target=$@ --sourcedir=$(srcdir) $<

resourcedir = $(pkgdatadir)
resource_DATA = ca.reyad.Compass.data.gresource 

appsdir = $(datadir)/applications
apps_DATA = ca.reyad.Compass.desktop

@INTLTOOL_DESKTOP_RULE@

gsettings_SCHEMAS = ca.reyad.Compass.gschema.xml

@GSETTINGS_RULES@

appstream_XML = ca.reyad.Compass.appdata.xml

@APPSTREAM_XML_RULES@
@INTLTOOL_XML_RULE@

ca.reyad.Compass.service: ca.reyad.Compass.service.in
	$(AM_V_GEN) sed \
		-e "s|[@]PACKAGE_NAME@|$(PACKAGE_NAME)|g" \
		-e "s|[@]pkgdatadir@|$(pkgdatadir)|g" \
		-e "s|[@]pkglibdir@|$(pkglibdir)|g" \
		$< > $@

servicedir = $(datadir)/dbus-1/services
service_DATA = ca.reyad.Compass.service

EXTRA_DIST = \
	ca.reyad.Compass.desktop.in \
	ca.reyad.Compass.service.in \
	ca.reyad.Compass.data.gresource.xml \
	$(gsettings_SCHEMAS) \
	ca.reyad.Compass.appdata.xml.in \
	$(app_resource_files) \
	$(NULL)

CLEANFILES = \
	ca.reyad.Compass.service \
	ca.reyad.Compass.data.gresource \
	ca.reyad.Compass.appdata.xml \
	ca.reyad.Compass.appdata.valid \
	$(apps_DATA) \
	*.valid \
	gschemas.compiled \
	$(NULL)

# For uninstalled use
all-local:
	$(GLIB_COMPILE_SCHEMAS) $(builddir)

-include $(top_srcdir)/git.mk
