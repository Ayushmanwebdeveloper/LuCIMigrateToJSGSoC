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
					
					for (var k = 0; k < mids.length; k++) {
							var mid = mids[k];
							var aliases = '';
							for (var j = 0; j < mid.aliases.length; j++) {
									var alias = mid.aliases[j];
									var sep = aliases === '' ? '' : ', ';
									aliases = alias.ipAddress + sep + aliases;
							}
					
							var host = mid.main.ipAddress;
							if (mid.proto === '6') {
									host = '[' + mid.main.ipAddress + ']';
							}
					
							var tr = E('div', { 'class': 'tr cbi-section-table-row cbi-rowstyle-' + i + ' proto-' + mid.proto }, [
									E('div', { 'class': 'td cbi-section-table-cell left' }, [
											E('a', { 'href': 'http://' + host + '/cgi-bin-status.html' }, mid.main.ipAddress)
									]),
									E('div', { 'class': 'td cbi-section-table-cell left' }, aliases)
							]);
					
							tableRows.push(tr);
							i = (i % 2) + 1;
					}
					
					var table = E('div', { 'class': 'table cbi-section-table' }, [
							E('div', { 'class': 'tr cbi-section-table-titles' }, [
									E('div', { 'class': 'th cbi-section-table-cell' }, _('OLSR node')),
									E('div', { 'class': 'th cbi-section-table-cell' }, _('Secondary OLSR interfaces'))
							]),
							tableRows
					]);
					
					var fieldset = E('fieldset', { 'class': 'cbi-section' }, [
							E('legend', {}, _('Overview of known multiple interface announcements')),
							table
					]);
					
				
				
        return E([], {}, [
            E('h2', {}, _('Active MID announcements')),
												fieldset
        ]);      
    }
})
