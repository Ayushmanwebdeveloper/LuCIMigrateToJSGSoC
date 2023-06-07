'use strict';
'require uci';
'require view';

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
					
					for (var k = 0; k < iface.length; k++) {
							var iface = iface[k];
					
							var tr = E('div', { 'class': 'tr cbi-section-table-row cbi-rowstyle-' + i + ' proto-' + iface.proto }, [
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.interface),
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.name),
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.olsrInterface.up ? _('up') : _('down')),
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.olsrInterface.mtu),
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.olsrInterface.wireless ? _('yes') : _('no')),
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.olsrInterface.ipAddress),
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.olsrInterface.ipv4Address !== '0.0.0.0' ? iface.olsrInterface.ipv4Netmask : ''),
									E('div', { 'class': 'td cbi-section-table-cell left' }, iface.olsrInterface.ipv4Address !== '0.0.0.0' ? iface.olsrInterface.ipv4Broadcast : iface.olsrInterface.ipv6Multicast)
							]);
					
							tableRows.push(tr);
							i = (i % 2) + 1;
					}
					
					var table = E('div', { 'class': 'table cbi-section-table' }, [
							E('div', { 'class': 'tr' }, [
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Interface')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Device')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('State')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('MTU')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('WLAN')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Source address')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Netmask')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Broadcast address'))
							]),
							tableRows
					]);
					
					var fieldset = E('fieldset', { 'class': 'cbi-section' }, [
							E('legend', {}, _('Overview of interfaces where OLSR is running')),
							table
					]);
					
					var h2 = E('h2', { 'name': 'content' }, _('Interfaces'));
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
