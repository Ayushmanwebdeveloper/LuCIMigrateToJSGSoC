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
					var i=1;
			  var cbiTable=E('div', { 'class': 'table cbi-section-table' }, [
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
				]);

				var tableRows = [];
				for (var k = 0; k < iface.length; k++) {
						var ifaceRow = iface[k];
						var tr = E('div', { 'class': 'tr cbi-section-table-row cbi-rowstyle-' + i + ' proto-' + ifaceRow.proto }, [
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.interface),
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.name),
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.olsrInterface.up ? luci.i18n.translate('up') : luci.i18n.translate('down')),
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.olsrInterface.mtu),
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.olsrInterface.wireless ? luci.i18n.translate('yes') : luci.i18n.translate('no')),
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.olsrInterface.ipAddress),
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.olsrInterface.ipv4Address !== '0.0.0.0' ? ifaceRow.olsrInterface.ipv4Netmask : ''),
								E('div', { 'class': 'td cbi-section-table-cell left' }, ifaceRow.olsrInterface.ipv4Address !== '0.0.0.0' ? ifaceRow.olsrInterface.ipv4Broadcast : ifaceRow.olsrInterface.ipv6Multicast)
						]);
						tableRows.push(tr);
						i = (i % 2) + 1;
				}
				
				
        return E([], {}, [
            E('h2', {}, _('Interfaces')),
												E('h2', {}, _('Overview of interfaces where OLSR is running')),
            cbiTable.append(tableRows)
        ]);      
    }
})
