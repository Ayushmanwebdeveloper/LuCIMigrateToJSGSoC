callGetJsonStatus = rpc.declare({
	object: 'file',
	method: 'exec',
	params: [ 'command', 'params', 'env' ]
});


function fetch_jsoninfo(otable) {
	var IpVersion = uci.get_first("olsrd", "olsrd", "IpVersion");
	var jsonreq4 = "";
	var jsonreq6 = "";
	var req="";
	var v4_port = parseInt(uci.get("olsrd", "olsrd_jsoninfo", "port") || "") || 9090;
	var v6_port = parseInt(uci.get("olsrd6", "olsrd_jsoninfo", "port") || "") || 9090;
 var json

	req=this.callGetJsonStatus('/usr/libexec/rpcd/fetch_jsoninfo',[otable, v4_port, v6_port])

try {
  json = JSON.parse(req);
} catch (err) {}

 jsonreq4 =json.jsonreq4;
	jsonreq6 =json.jsonreq6;
	var jsondata4 = {};
	var jsondata6 = {};
	var data4 = [];
	var data6 = [];
	var has_v4 = false;
	var has_v6 = false;

	if (jsonreq4 === "" && jsonreq6 === "") {
	   	window.location.href = "status-olsr/error_olsr";
     return [null, 0, 0, true];
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

	return [data4, has_v4, has_v6, false];
}
