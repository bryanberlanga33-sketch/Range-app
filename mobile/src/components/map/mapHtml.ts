/**
 * Self-contained Leaflet map document shared by the web (`<iframe srcDoc>`) and
 * native (`react-native-webview`) implementations of MapCanvas.
 *
 * Bridge protocol (messages are JSON strings):
 *  - page -> host:  { type: 'ready' }                 once the map is initialized
 *  - page -> host:  { type: 'add', lat, lng }          when the user taps the map
 *  - host -> page:  window.__render("<json>")          to (re)draw the scene
 *
 * Render payload:
 *  {
 *    polygon:    [[lat,lng], ...],          // filled boundary polygon
 *    vertices:   [[lat,lng], ...],          // small numbered guide markers
 *    dataPoints: [{ lat, lng, label }, ...] // labeled pins
 *  }
 *
 * The page emits to `window.ReactNativeWebView` (native) when present, otherwise
 * to `window.parent` (web iframe).
 */
export const MAP_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
      .leaflet-container { background: #dfe7d2; }
      .point-label {
        background: #3f5a26; color: #fff; border: none; border-radius: 6px;
        padding: 2px 6px; font: 600 12px system-ui, sans-serif; box-shadow: 0 1px 2px rgba(0,0,0,.3);
      }
      .point-label::before { border-top-color: #3f5a26; }
      .vertex-label {
        background: transparent; border: none; box-shadow: none;
        color: #3f5a26; font: 700 11px system-ui, sans-serif;
      }
      .vertex-label::before { display: none; }
    </style>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      (function () {
        function emit(msg) {
          var s = JSON.stringify(msg);
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(s);
          } else if (window.parent && window.parent !== window) {
            window.parent.postMessage(s, '*');
          }
        }

        var map = L.map('map', { zoomControl: true }).setView([41.0, -107.0], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        var layers = [];

        map.on('click', function (e) {
          emit({ type: 'add', lat: e.latlng.lat, lng: e.latlng.lng });
        });

        window.__render = function (json) {
          var data;
          try { data = JSON.parse(json); } catch (err) { return; }
          if (!data) return;

          layers.forEach(function (l) { map.removeLayer(l); });
          layers = [];

          var polygon = data.polygon || [];
          var vertices = data.vertices || [];
          var dataPoints = data.dataPoints || [];

          if (polygon.length >= 3) {
            layers.push(
              L.polygon(polygon, {
                color: '#3f5a26', weight: 2, fillColor: '#7a9a4a', fillOpacity: 0.3,
              }).addTo(map)
            );
          } else if (polygon.length === 2) {
            layers.push(L.polyline(polygon, { color: '#3f5a26', weight: 2 }).addTo(map));
          }

          vertices.forEach(function (v, i) {
            var marker = L.circleMarker(v, {
              radius: 6, color: '#3f5a26', weight: 2, fillColor: '#ffffff', fillOpacity: 1,
            }).addTo(map);
            marker.bindTooltip(String(i + 1), {
              permanent: true, direction: 'center', className: 'vertex-label',
            });
            layers.push(marker);
          });

          dataPoints.forEach(function (p) {
            var marker = L.marker([p.lat, p.lng]).addTo(map);
            if (p.label) {
              marker.bindTooltip(p.label, {
                permanent: true, direction: 'top', className: 'point-label',
              });
            }
            layers.push(marker);
          });

          // Fit to the boundary (polygon + vertices) so adding data points
          // inside it does not shift the view.
          var fitCoords = polygon.concat(vertices);
          if (fitCoords.length === 0) {
            fitCoords = dataPoints.map(function (p) { return [p.lat, p.lng]; });
          }
          if (fitCoords.length >= 1) {
            try { map.fitBounds(L.latLngBounds(fitCoords).pad(0.5), { maxZoom: 16 }); } catch (err) {}
          }
        };

        window.addEventListener('message', function (ev) {
          if (typeof ev.data === 'string') {
            window.__render(ev.data);
          }
        });

        setTimeout(function () {
          map.invalidateSize();
          emit({ type: 'ready' });
        }, 100);
      })();
    </script>
  </body>
</html>`
