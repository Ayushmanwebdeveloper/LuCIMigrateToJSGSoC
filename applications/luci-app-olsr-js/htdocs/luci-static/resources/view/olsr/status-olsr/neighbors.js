'use strict';
'require uci';
'require view';
'require poll'

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
							for (var k = 0; k < links.length; k++) {
									var link = links[k];
									link.linkCost = parseInt(link.linkCost) || 0;
									if (link.linkCost === 4194304) {
											link.linkCost = 0;
									}
									var color = etx_color(link.linkCost);
									var snr_color = snr_colors(link.snr);
									var defaultgw_color = "";
									if (link.defaultgw === 1) {
											defaultgw_color = "#ffff99";
									}
					
									rv.push({
											rip: link.remoteIP,
											hn: link.hostname,
											lip: link.localIP,
											ifn: link.interface,
											lq: link.linkQuality.toFixed(3),
											nlq: link.neighborLinkQuality.toFixed(3),
											cost: link.linkCost.toFixed(3),
											snr: link.snr,
											signal: link.signal,
											noise: link.noise,
											color: color,
											snr_color: snr_color,
											dfgcolor: defaultgw_color,
											proto: link.proto
									});
					}
					poll.add(function(rv)
					{
					var nt = document.getElementById('olsr_neigh_table');
						if (nt)
						{
							var s = '<div class="tr cbi-section-table-cell">' +
							'<div class="th cbi-section-table-cell"><%:Neighbour IP%></div>' +
							'<div class="th cbi-section-table-cell"><%:Hostname%></div>' +
							'<div class="th cbi-section-table-cell"><%:Interface%></div>' +
							'<div class="th cbi-section-table-cell"><%:Local interface IP%></div>' +
							'<div class="th cbi-section-table-cell">LQ</div>' +
							'<div class="th cbi-section-table-cell">NLQ</div>' +
							'<div class="th cbi-section-table-cell">ETX</div>' +
							'<div class="th cbi-section-table-cell">SNR</div>' +
							'</div>';
			
							for (var idx = 0; idx < rv.length; idx++)
							{
								var neigh = rv[idx];
			
								if (neigh.proto == '6') {
									s += '<div class="tr cbi-section-table-row cbi-rowstyle-' + (1 + (idx % 2)) + ' proto-' + neigh.proto + '">' +
													'<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '"><a href="http://[' + neigh.rip + ']/cgi-bin-status.html">' + neigh.rip + '</a></div>';
					} else {
									s += '<div class="tr cbi-section-table-row cbi-rowstyle-' + (1 + (idx % 2)) + ' proto-' + neigh.proto + '">' +
													'<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '"><a href="http://' + neigh.rip + '/cgi-bin-status.html">' + neigh.rip + '</a></div>';
					}
					if (neigh.hn) {
									s += '<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '"><a href="http://' + neigh.hn + '/cgi-bin-status.html">' + neigh.hn + '</a></div>';
					} else {
									s += '<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '">?</div>';
					}
					s += '<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '">' + neigh.ifn + '</div>' +
									'<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '">' + neigh.lip + '</div>' +
									'<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '">' + neigh.lq + '</div>' +
									'<div class="td cbi-section-table-cell left" style="background-color:' + neigh.dfgcolor + '">' + neigh.nlq + '</div>' +
									'<div class="td cbi-section-table-cell left" style="background-color:' + neigh.color + '">' + neigh.cost + '</div>' +
									'<div class="td cbi-section-table-cell left" style="background-color:' + neigh.snr_color + '" title="Signal: ' + neigh.signal + ' Noise: ' + neigh.noise + '">' + (neigh.snr || '?') + '</div>' +
									'</div>';
	}

	nt.innerHTML = s;
						}
					}, 10);
				
			
					var tableRows = [];
var i = 1;

for (var k = 0; k < links.length; k++) {
  var link = links[k];
  link.linkCost = parseInt(link.linkCost) || 0;
  if (link.linkCost === 4194304) {
    link.linkCost = 0;
  }

  color = olsrtools.etx_color(link.linkCost);
  snr_color = olsrtools.snr_colors(link.snr);

  if (link.snr === 0) {
    link.snr = '?';
  }

  var defaultgw_color = "";
  if (link.defaultgw === 1) {
    defaultgw_color = "#ffff99";
  }

  var tr = E('div', { 'class': 'tr cbi-section-table-row cbi-rowstyle-' + i + ' proto-' + link.proto }, [
    link.proto === "6" ? E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + defaultgw_color }, [
      E('a', { 'href': 'http://[' + link.remoteIP + ']/cgi-bin-status.html' }, link.remoteIP)
    ]) : E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + defaultgw_color }, [
      E('a', { 'href': 'http://' + link.remoteIP + '/cgi-bin-status.html' }, link.remoteIP)
    ]),
    E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + defaultgw_color }, [
      E('a', { 'href': 'http://' + link.hostname + '/cgi-bin-status.html' }, link.hostname)
    ]),
    E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + defaultgw_color }, link.interface),
    E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + defaultgw_color }, link.localIP),
    E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + defaultgw_color }, [
      E('div', {}, (link.linkQuality).toFixed(3))
    ]),
    E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + defaultgw_color }, [
      E('div', {}, (link.neighborLinkQuality).toFixed(3))
    ]),
    E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + color }, [
      E('div', {}, (link.linkCost).toFixed(3))
    ]),
    E('div', { 'class': 'td cbi-section-table-cell left', 'style': 'background-color:' + snr_color, 'title': 'Signal: ' + link.signal + ' Noise: ' + link.noise }, link.snr)
  ]);

  tableRows.push(tr);
  i = (i % 2) + 1;
}

var table = E('div', { 'class': 'table cbi-section-table', 'id': 'olsr_neigh_table' }, [
  E('div', { 'class': 'tr cbi-section-table-cell' }, [
    E('div', { 'class': 'th cbi-section-table-cell' }, _('Neighbour IP')),
    E('div', { 'class': 'th cbi-section-table-cell' }, _('Hostname')),
    E('div', { 'class': 'th cbi-section-table-cell' }, _('Interface')),
    E('div', { 'class': 'th cbi-section-table-cell' }, _('Local interface IP')),
    E('div', { 'class': 'th cbi-section-table-cell' }, 'LQ'),
    E('div', { 'class': 'th cbi-section-table-cell' }, 'NLQ'),
    E('div', { 'class': 'th cbi-section-table-cell' }, 'ETX'),
    E('div', { 'class': 'th cbi-section-table-cell' }, 'SNR')
  ]),
  tableRows
]);

var fieldset = E('fieldset', { 'class': 'cbi-section' }, [
  E('legend', {}, _('Overview of currently established OLSR connections')),
  table
]);

var h2 = E('h2', { 'name': 'content' }, _('OLSR connections'));
var divToggleButtons = E('div', { 'id': 'togglebuttons' });
var statusOlsrLegend;
var statusOlsrCommonJs;

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
