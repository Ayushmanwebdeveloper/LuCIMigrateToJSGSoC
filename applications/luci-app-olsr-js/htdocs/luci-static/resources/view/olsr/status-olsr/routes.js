'use strict';
'require uci';
'require view';
'require poll';
'require network';

function etx_color(etx) {
	let color = "#bb3333";
	if (etx === 0) {
			color = "#bb3333";
	} else if (etx < 2) {
			color = "#00cc00";
	} else if (etx < 4) {
			color = "#ffcb05";
	} else if (etx < 10) {
			color = "#ff6600";
	}
	return color;
}

return view.extend({

	callGetJsonStatus: rpc.declare({
		object: 'olsrinfo',
		method: 'getjsondata',
		params: [ 'otable', 'v4_port', 'v6_port' ]
	}),

	fetch_jsoninfo: function (otable) {
		var jsonreq4 = "";
		var jsonreq6 = "";
		var v4_port = parseInt(uci.get("olsrd", "olsrd_jsoninfo", "port") || "") || 9090;
		var v6_port = parseInt(uci.get("olsrd6", "olsrd_jsoninfo", "port") || "") || 9090;
		var json;
	
		return new Promise(function(resolve, reject) {
				L.resolveDefault(this.callGetJsonStatus(otable, v4_port, v6_port), {})
						.then(function(res) {
								try {
										json = JSON.parse(res);
								} catch (err) {}
	
								jsonreq4 = json.jsonreq4;
								jsonreq6 = json.jsonreq6;
								var jsondata4 = {};
								var jsondata6 = {};
								var data4 = [];
								var data6 = [];
								var has_v4 = false;
								var has_v6 = false;
	
								if (jsonreq4 === "" && jsonreq6 === "") {
										window.location.href = "status-olsr/error_olsr";
										reject([null, 0, 0, true]);
										return;
								}
	
								if (jsonreq4 !== "") {
										has_v4 = true;
										jsondata4 = jsonreq4 || {};
										if (otable === "status") {
												data4 = jsondata4;
										} else {
												data4 = jsondata4[otable] || [];
										}
	
										for (var i = 0; i < data4.length; i++) {
												data4[i]["proto"] = "4";
										}
								}
	
								if (jsonreq6 !== "") {
										has_v6 = true;
										jsondata6 = jsonreq6 || {};
										if (otable === "status") {
												data6 = jsondata6;
										} else {
												data6 = jsondata6[otable] || [];
										}
	
										for (var j = 0; j < data6.length; j++) {
												data6[j]["proto"] = "6";
										}
								}
	
								for (var k = 0; k < data6.length; k++) {
										data4.push(data6[k]);
								}
	
								resolve([data4, has_v4, has_v6, false]);
						})
						.catch(function(err) {
								console.error(err);
								reject([null, 0, 0, true]);
						});
		});
	},
	action_routes: function() {
  return new Promise(function(resolve, reject) {
    this.fetch_jsoninfo('routes')
      .then(function([data, has_v4, has_v6, error]) {
        if (error) {
          reject(error);
        }

        var resolveVal = uci.get("luci_olsr", "general", "resolve");

        function compare(a, b) {
          if (a.proto === b.proto) {
            return a.rtpMetricCost < b.rtpMetricCost;
          } else {
            return a.proto < b.proto;
          }
        }

								network.getHostHints().then(function(hosthints) {
									var modifiedData = data.map(function(v) {
											if (resolveVal === "1") {
													var hostname = hosthints.getHostnameByIPAddr(v.gateway);
													if (hostname) {
															v.hostname = hostname;
													}
											}
											return v;
									});
							}).catch(function(err) {
									var modifiedData = data;
									console.error(err);
							});
							

							modifiedData.sort(compare);

        var result = { routes: modifiedData, has_v4: has_v4, has_v6: has_v6 };
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
					var routes_res;
					var has_v4;
					var has_v6;

					this.action_routes().then(function(result) {
						routes_res = result.routes;
						has_v4 = result.has_v4;
						has_v6 = result.has_v6;
					}).catch(function(error) {
					 console.error(error);
				});
					var rv = [];
					for (var k = 0; k < routes_res.length; k++) {
									var route = routes_res[k];
									var ETX = (parseFloat(route.etx) || 0).toFixed(3);
									rv.push({
													hostname: route.hostname,
													dest: route.destination,
													genmask: route.genmask,
													gw: route.gateway,
													interface: route.networkInterface,
													metric: route.metric,
													etx: ETX,
													color: etx_color(parseFloat(ETX))
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
					
					for (var k = 0; k < routes_res.length; k++) {
							var route = routes_res[k];
							var ETX = parseInt(route.etx) || 0;
							var color = etx_color(ETX);
					
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
					var statusOlsrLegend=E('div', {}, [
						E('h3', {}, [_('Legend') + ':']),
						E('ul', {}, [
								E('li', {}, [
										E('strong', {}, [_('LQ: ')]),
										_('Success rate of packages received from the neighbour')
								]),
								E('li', {}, [
										E('strong', {}, [_('NLQ: ')]),
										_('Success rate of packages sent to the neighbour')
								]),
								E('li', {}, [
										E('strong', {}, [_('ETX: ')]),
										_('Expected retransmission count')
								]),
								E('li', { style: 'list-style: none' }, [
										E('ul', {}, [
												E('li', {}, [
														E('strong', { style: 'color:#00cc00' }, [_('Green')]),
														':',
														_('Very good (ETX < 2)')
												]),
												E('li', {}, [
														E('strong', { style: 'color:#ffcb05' }, [_('Yellow')]),
														':',
														_('Good (2 < ETX < 4)')
												]),
												E('li', {}, [
														E('strong', { style: 'color:#ff6600' }, [_('Orange')]),
														':',
														_('Still usable (4 < ETX < 10)')
												]),
												E('li', {}, [
														E('strong', { style: 'color:#bb3333' }, [_('Red')]),
														':',
														_('Bad (ETX > 10)')
												])
										])
								]),
								E('li', {}, [
										E('strong', {}, [_('SNR: ')]),
										_('Signal Noise Ratio in dB')
								]),
								E('li', { style: 'list-style: none' }, [
										E('ul', {}, [
												E('li', {}, [
														E('strong', { style: 'color:#00cc00' }, [_('Green')]),
														':',
														_('Very good (SNR > 30)')
												]),
												E('li', {}, [
														E('strong', { style: 'color:#ffcb05' }, [_('Yellow')]),
														':',
														_('Good (30 > SNR > 20)')
												]),
												E('li', {}, [
														E('strong', { style: 'color:#ff6600' }, [_('Orange')]),
														':',
														_('Still usable (20 > SNR > 5)')
												]),
												E('li', {}, [
														E('strong', { style: 'color:#bb3333' }, [_('Red')]),
														':',
														_('Bad (SNR < 5)')
												])
										])
								])
						])
					]);
					
					var statusOlsrCommonJs = null;
					
					if (has_v4 && has_v6) {
						statusOlsrCommonJs=	E('script', { 'type': 'text/javascript', 'src': L.resource('common/common_js.js') });
					}
					
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
