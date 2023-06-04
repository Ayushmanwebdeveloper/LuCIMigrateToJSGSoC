'use strict';
'require uci';
'require view';
'require poll';
import { etx_color, snr_colors } from "./olsrtools";
return view.extend({
    load: () => {
        return Promise.all([
            uci.load('olsrd'),
            uci.load('system')    
        ])
    },
    render: () => {
					
					var rv = [];
					for (var k = 0; k < routes.length; k++) {
									var route = routes[k];
									var ETX = (parseFloat(route.etx) || 0).toFixed(3);
									rv.push({
													hostname: route.hostname,
													dest: route.destination,
													genmask: route.genmask,
													gw: route.gateway,
													interface: route.networkInterface,
													metric: route.metric,
													etx: ETX,
													color: olsrtools.etx_color(parseFloat(ETX))
									});
					}
					poll.add(function(rv)
					{
						var rt = document.getElementById('olsrd_routes');
						if (rt) {
										var s = '<div class="tr cbi-section-table-cell">' +
														'<div class="th cbi-section-table-cell"><%:Announced network%></div>' +
														'<div class="th cbi-section-table-cell"><%:OLSR gateway%></div>' +
														'<div class="th cbi-section-table-cell"><%:Interface%></div>' +
														'<div class="th cbi-section-table-cell"><%:Metric%></div>' +
														'<div class="th cbi-section-table-cell">ETX</div>' +
														'</div>';
						
										for (var idx = 0; idx < rv.length; idx++) {
														var route = rv[idx];
						
														s += '<div class="tr cbi-section-table-row cbi-rowstyle-' + (1 + (idx % 2)) + ' proto-' + route.proto + '">' +
																		'<div class="td cbi-section-table-cell left">' + route.dest + '/' + route.genmask + '</div>' +
																		'<div class="td cbi-section-table-cell left">' +
																		'<a href="http://' + route.gw + '/cgi-bin-status.html">' + route.gw + '</a>';
						
														if (route.hostname) {
																		if (route.proto == '6') {
																						s += ' / <a href="http://[' + route.hostname + ']/cgi-bin-status.html">' + (route.hostname || '?') + '</a>';
																		} else {
																						s += ' / <a href="http://' + route.hostname + '/cgi-bin-status.html">' + (route.hostname || '?') + '</a>';
																		}
														}
						
														s += '</div>' +
																		'<div class="td cbi-section-table-cell left">' + route.interface + '</div>' +
																		'<div class="td cbi-section-table-cell left">' + route.metric + '</div>' +
																		'<div class="td cbi-section-table-cell left" style="background-color:' + route.color + '">' + (route.etx || '?') + '</div>' +
																		'</div>';
										}
						
										rt.innerHTML = s;
						}
						
					}, 10);
				
			


					var tableRows = [];
					var i = 1;
					
					for (var k = 0; k < routes.length; k++) {
							var route = routes[k];
							var ETX = parseInt(route.etx) || 0;
							var color = olsrtools.etx_color(ETX);
					
							var tr = E('div', { 'class': 'tr cbi-section-table-row cbi-rowstyle-' + i + ' proto-' + route.proto }, [
									E('div', { 'class': 'td cbi-section-table-cell left' }, route.destination + '/' + route.genmask),
									E('div', { 'class': 'td cbi-section-table-cell left' }, [
											route.proto === '6' ? E('a', { 'href': 'http://[' + route.gateway + ']/cgi-bin-status.html' }, route.gateway) :
													E('a', { 'href': 'http://' + route.gateway + '/cgi-bin-status.html' }, route.gateway),
											route.hostname ? E('span', {}, ' / ', [
													E('a', { 'href': 'http://' + route.Hostname + '/cgi-bin-status.html' }, route.hostname)
											]) : null
									]),
									E('div', { 'class': 'td cbi-section-table-cell left' }, route.networkInterface),
									E('div', { 'class': 'td cbi-section-table-cell left' }, route.metric),
									E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + color }, [
									 ETX.toFixed(3)
									])
							]);
					
							tableRows.push(tr);
							i = (i % 2) + 1;
					}
					
					var table = E('div', { 'class': 'table cbi-section-table', 'id': 'olsrd_routes' }, [
							E('div', { 'class': 'tr cbi-section-table-cell' }, [
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Announced network')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('OLSR gateway')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Interface')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Metric')),
									E('div', { 'class': 'th cbi-section-table-cell' }, 'ETX')
							]),
							tableRows
					]);
					
					var fieldset = E('fieldset', { 'class': 'cbi-section' }, [
							E('legend', {}, _('Overview of currently known routes to other OLSR nodes')),
							table
					]);
					
					var h2 = E('h2', { 'name': 'content' }, _('Known OLSR routes'));
					var divToggleButtons = E('div', { 'id': 'togglebuttons' });
					var statusOlsrLegend;
					var statusOlsrCommonJs;
					var footer;
					
					var result = E([], {}, [
							h2,
							divToggleButtons,
							fieldset,
							statusOlsrLegend,
							statusOlsrCommonJs
					]);
					
					return result;
							
    }
})
