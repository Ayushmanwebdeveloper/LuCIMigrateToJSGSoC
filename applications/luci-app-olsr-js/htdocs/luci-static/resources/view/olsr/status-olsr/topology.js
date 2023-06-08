'use strict';
'require uci';
'require view';
'require poll';

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
    load: () => {
        return Promise.all([
            uci.load('olsrd'),
            uci.load('system')    
        ])
    },
    render: () => {
					var tableRows = [];
					var i = 1;
					
					for (var k = 0; k < routes.length; k++) {
							var route = routes[k];
							var cost = (parseInt(route.tcEdgeCost) || 0).toFixed(3);
							var color = olsrtools.etx_color(parseInt(cost));
							var lq = (parseInt(route.linkQuality) || 0).toFixed(3);
							var nlq = (parseInt(route.neighborLinkQuality) || 0).toFixed(3);
					
							var tr = E('div', { 'class': 'tr cbi-section-table-row cbi-rowstyle-' + i + ' proto-' + route.proto }, [
									route.proto === '6' ? E('div', { 'class': 'td cbi-section-table-cell left' }, [
											E('a', { 'href': 'http://[' + route.destinationIP + ']/cgi-bin-status.html' }, route.destinationIP)
									]) : E('div', { 'class': 'td cbi-section-table-cell left' }, [
											E('a', { 'href': 'http://' + route.destinationIP + '/cgi-bin-status.html' }, route.destinationIP)
									]),
									route.proto === '6' ? E('div', { 'class': 'td cbi-section-table-cell left' }, [
											E('a', { 'href': 'http://[' + route.lastHopIP + ']/cgi-bin-status.html' }, route.lastHopIP)
									]) : E('div', { 'class': 'td cbi-section-table-cell left' }, [
											E('a', { 'href': 'http://' + route.lastHopIP + '/cgi-bin-status.html' }, route.lastHopIP)
									]),
									E('div', { 'class': 'td cbi-section-table-cell left' }, lq),
									E('div', { 'class': 'td cbi-section-table-cell left' }, nlq),
									E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + color }, cost)
							]);
					
							tableRows.push(tr);
							i = (i % 2) + 1;
					}
					
					var table = E('div', { 'class': 'table cbi-section-table' }, [
							E('div', { 'class': 'tr cbi-section-table-titles' }, [
									E('div', { 'class': 'th cbi-section-table-cell' }, _('OLSR node')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Last hop')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('LQ')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('NLQ')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('ETX'))
							]),
							tableRows
					]);
					
					var fieldset = E('fieldset', { 'class': 'cbi-section' }, [
							E('legend', {}, _('Overview of currently known OLSR nodes')),
							table
					]);
					
					var h2 = E('h2', { 'name': 'content' }, _('Active OLSR nodes'));
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
