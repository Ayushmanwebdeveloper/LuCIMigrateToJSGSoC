'use strict';
'require uci';
'require view';
'require poll'
'require network';


return view.extend({

	action_hna: function() {
  return new Promise(function(resolve, reject) {
    fetch_jsoninfo('hna')
      .then(function([data, has_v4, has_v6, error]) {
        if (error) {
          reject(error);
        }

        var resolve = uci.get("luci_olsr", "general", "resolve");

        function compare(a, b) {
          if (a.proto === b.proto) {
            return a.genmask < b.genmask;
          } else {
            return a.proto < b.proto;
          }
        }

        for (var k = 0; k < data.length; k++) {
          var v = data[k];
          if (resolve === "1") {
            hostname = nixio.getnameinfo(v.gateway, null, 100);
            if (hostname) {
              v.hostname = hostname;
            }
          }
          if (v.validityTime) {
            v.validityTime = parseInt((v.validityTime / 1000).toFixed(0));
          }
        }

        data.sort(compare);

        var result = { hna: data, has_v4: has_v4, has_v6: has_v6 };
        resolve(result);
      })
      .catch(function(err) {
        reject(err);
      });
  });
},
	

 load: () => {
        return Promise.all([
            uci.load('olsrd'),
            uci.load('system')    
        ])
    },
    render: () => {
					var hna;
					var has_v4;
					var has_v6;
					this.action_hna().then(function(result) {
						hna = result.hna;
						has_v4 = result.has_v4;
						has_v6 = result.has_v6;
					}).catch(function(error) {
					 console.error(error);
				});

					var i = 1;

					var rv = [];
							for (var k = 0; k < hna.length; k++) {
									var entry = hna[k];
									rv.push({
											proto: entry.proto,
											destination: entry.destination,
											genmask: entry.genmask,
											gateway: entry.gateway,
											hostname: entry.hostname,
											validityTime: entry.validityTime
									});
					}
					
							
					
					poll.add(function(rv)
					{
						var hnadiv = document.getElementById('olsrd_hna');
						if (hnadiv) {
								var s = '<div class="tr cbi-section-table-titles">' +
										'<div class="th cbi-section-table-cell"><%:Announced network%></div>' +
										'<div class="th cbi-section-table-cell"><%:OLSR gateway%></div>' +
										'<div class="th cbi-section-table-cell"><%:Validity Time%></div>' +
										'</div>';
						
								for (var idx = 0; idx < info.length; idx++) {
										var hna = info[idx];
										var linkgw = '';
										s += '<div class="tr cbi-section-table-row cbi-rowstyle-' + (1 + (idx % 2)) + ' proto-' + hna.proto + '">';
						
										if (hna.proto === '6') {
												linkgw = '<a href="http://[' + hna.gateway + ']/cgi-bin-status.html">' + hna.gateway + '</a>';
										} else {
												linkgw = '<a href="http://' + hna.gateway + '/cgi-bin-status.html">' + hna.gateway + '</a>';
										}
						
										var validity = hna.validityTime !== undefined ? hna.validityTime + 's' : '-';
										var hostname = hna.hostname !== undefined ? ' / <a href="http://' + hna.hostname + '/cgi-bin-status.html">' + hna.hostname + '</a>' : '';
						
										s += '<div class="td cbi-section-table-cell left">' + (hna.destination + '/' + hna.genmask) + '</div>' +
												'<div class="td cbi-section-table-cell left">' + (linkgw + hostname) + '</div>' +
												'<div class="td cbi-section-table-cell left">' + validity + '</div>'+
												'</div>';
								}
						
								hnadiv.innerHTML = s;
						}
						
					}, 10);
				
					var tableRows = [];
					var i = 1;
					
					for (var k = 0; k < hna.length; k++) {
							var route = hna[k];
					
							var tr = E('div', { 'class': 'tr cbi-section-table-row cbi-rowstyle-' + i + ' proto-' + route.proto }, [
									E('div', { 'class': 'td cbi-section-table-cell left' }, route.destination + '/' + route.genmask),
									E('div', { 'class': 'td cbi-section-table-cell left' }, [
											route.proto === '6' ? E('a', { 'href': 'http://[' + route.gateway + ']/cgi-bin-status.html' }, route.gateway) : E('a', { 'href': 'http://' + route.gateway + '/cgi-bin-status.html' }, route.gateway),
											route.hostname ? E('span', {}, ' / ', E('a', { 'href': 'http://' + route.hostname + '/cgi-bin-status.html' }, route.hostname)) : null
									]),
									E('div', { 'class': 'td cbi-section-table-cell left' }, route.validityTime ? route.validityTime + 's' : '-')
							]);
					
							tableRows.push(tr);
							i = (i % 2) + 1;
					}
					
					var table = E('div', { 'class': 'table cbi-section-table', 'id': 'olsrd_hna' }, [
							E('div', { 'class': 'tr cbi-section-table-titles' }, [
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Announced network')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('OLSR gateway')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Validity Time'))
							]),
							tableRows
					]);
					
					var fieldset = E('fieldset', { 'class': 'cbi-section' }, [
							E('legend', {}, _('Overview of currently active OLSR host net announcements')),
							table
					]);
					
					var h2 = E('h2', { 'name': 'content' }, _('Active host net announcements'));
					var divToggleButtons = E('div', { 'id': 'togglebuttons' });
					var statusOlsrCommonJs = null;

					if (has_v4 && has_v6) {
						statusOlsrCommonJs=	E('script', { 'type': 'text/javascript', 'src': L.resource('common/common_js.js') });
					}
					
					var result = E([], {}, [
							h2,
							divToggleButtons,
							fieldset,
							statusOlsrCommonJs
					]);
					
					return result;
					
				}
})
