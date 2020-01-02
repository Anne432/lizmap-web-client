import olGeolocation from 'ol/Geolocation.js';
import { mainLizmap } from '../modules/Globals.js';

export default class Geolocation {

    constructor() {
        this._firstGeolocation = true;
    }

    moveGeolocationPointAndCircle(coordinates) {
        // TODO : change newGeolocation to geolocation after old code removed
        let geolocationLayer = mainLizmap._lizmap3.map.getLayersByName('newGeolocation')[0];
        const circleStyle = {
            fillColor: '#0395D6',
            fillOpacity: 0.1,
            strokeColor: '#0395D6',
            strokeWidth: 1
        };

        // Create layer if it does not exist
        if (geolocationLayer === undefined){
            geolocationLayer = new OpenLayers.Layer.Vector('newGeolocation');

            geolocationLayer.addFeatures([
                new OpenLayers.Feature.Vector(
                    // Point
                    new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]),
                    {},
                    {
                        graphicName: 'circle',
                        strokeColor: '#0395D6',
                        strokeWidth: 1,
                        fillOpacity: 1,
                        fillColor: '#0395D6',
                        pointRadius: 3
                    }
                ),
                // circle
                new OpenLayers.Feature.Vector(
                    OpenLayers.Geometry.Polygon.createRegularPolygon(
                        new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]),
                        this._geolocation.getAccuracy() / 2,
                        40,
                        0
                    ),
                    {},
                    circleStyle
                )
            ]);
            mainLizmap._lizmap3.map.addLayer(geolocationLayer);
        }else{
            const geolocationPoint = geolocationLayer.features[0];

            geolocationPoint.geometry.x = coordinates[0];
            geolocationPoint.geometry.y = coordinates[1];
            geolocationPoint.geometry.clearBounds();
            geolocationLayer.drawFeature(geolocationPoint);

            let geolocationCircle = geolocationLayer.features[1];
            geolocationLayer.destroyFeatures([geolocationCircle]);
            geolocationCircle = new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]),
                    this._geolocation.getAccuracy() / 2,
                    40,
                    0
                ),
                {},
                circleStyle
            );
            geolocationLayer.addFeatures([geolocationCircle]);
        }
    }

    toggleGeolocation() {
        if (this._geolocation === undefined) {
            this._geolocation = new olGeolocation({
                // enableHighAccuracy must be set to true to have the heading value.
                trackingOptions: {
                    enableHighAccuracy: true
                },
                projection: mainLizmap.projection
            });

            this._geolocation.on('change:position', () => {
                const coordinates = this._geolocation.getPosition();
                this.moveGeolocationPointAndCircle(coordinates);
            });

            this._geolocation.on('change:accuracyGeometry', () => {
                // Zoom on accuracy geometry extent when geolocation is activated for the first time
                if (this._firstGeolocation) {
                    mainLizmap.extent = this._geolocation.getAccuracyGeometry();
                    mainLizmap.center = this._geolocation.getPosition();
                    this._firstGeolocation = false;
                }
            });
        }

        this._geolocation.setTracking(!this._geolocation.getTracking());
    }
}
