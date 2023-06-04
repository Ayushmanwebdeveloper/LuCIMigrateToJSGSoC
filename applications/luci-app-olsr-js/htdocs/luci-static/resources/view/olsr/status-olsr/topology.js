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
					var statusOlsrLegend;
					var statusOlsrCommonJs;
					var footer;
					
					var result = E([], {}, [
							h2,
							divToggleButtons,
							fieldset,
							statusOlsrLegend,
							statusOlsrCommonJs,
							footer
					]);
					
					return result;
					
							
    }
})
