'use strict';
'require uci';
'require view';
'require poll'


return view.extend({
    load: () => {
        return Promise.all([
            uci.load('olsrd'),
            uci.load('system')    
        ])
    },
    render: () => {
				
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
