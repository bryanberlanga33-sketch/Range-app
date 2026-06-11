/**
 * Self-contained Leaflet map document used by both the web (`<iframe srcDoc>`)
 * and native (`react-native-webview`) implementations of MapFence.
 *
 * Bridge protocol (messages are JSON strings):
 *  - page -> host:  { type: 'ready' }                       once the map is initialized
 *  - page -> host:  { type: 'add', lat, lng }               when the user taps the map
 *  - host -> page:  window.__renderPoints("<json point[]>") to (re)draw markers + polygon
 *
 * The page emits to `window.ReactNativeWebView` (native) when present, otherwise
 * to `window.parent` (web iframe). The host pushes point updates via postMessage
 * (web) or injectJavaScript calling `window.__renderPoints` (native).
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

        var markers = [];
        var shape = null;

        map.on('click', function (e) {
          emit({ type: 'add', lat: e.latlng.lat, lng: e.latlng.lng });
        });

        window.__renderPoints = function (json) {
          var points;
          try { points = JSON.parse(json); } catch (err) { return; }
          if (!Array.isArray(points)) return;

          markers.forEach(function (m) { map.removeLayer(m); });
          markers = [];
          if (shape) { map.removeLayer(shape); shape = null; }

          var latlngs = points.map(function (p) { return [p.lat, p.lng]; });

          points.forEach(function (p, i) {
            var marker = L.marker([p.lat, p.lng]).addTo(map);
            marker.bindTooltip(p.name || ('Point ' + (i + 1)), {
              permanent: true,
              direction: 'top',
              className: 'point-label',
            });
            markers.push(marker);
          });

          if (latlngs.length >= 3) {
            shape = L.polygon(latlngs, {
              color: '#3f5a26',
              weight: 2,
              fillColor: '#7a9a4a',
              fillOpacity: 0.3,
            }).addTo(map);
          } else if (latlngs.length === 2) {
            shape = L.polyline(latlngs, { color: '#3f5a26', weight: 2 }).addTo(map);
          }

          if (latlngs.length >= 1) {
            try { map.fitBounds(L.latLngBounds(latlngs).pad(0.5), { maxZoom: 16 }); } catch (err) {}
          }
        };

        // Host -> page channel for the web iframe (native uses injectJavaScript).
        window.addEventListener('message', function (ev) {
          if (typeof ev.data === 'string') {
            window.__renderPoints(ev.data);
          }
        });

        // Give Leaflet a tick to lay out before announcing readiness.
        setTimeout(function () {
          map.invalidateSize();
          emit({ type: 'ready' });
        }, 100);
      })();
    </script>
  </body>
</html>`
