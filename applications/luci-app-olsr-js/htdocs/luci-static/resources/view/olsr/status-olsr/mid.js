'use strict';
'require uci';
'require view';

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
									var v = mid.aliases[j];
									var sep = aliases === '' ? '' : ', ';
									aliases = v.ipAddress + sep + aliases;
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
					
					var h2 = E('h2', { 'name': 'content' }, _('Active MID announcements'));
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
