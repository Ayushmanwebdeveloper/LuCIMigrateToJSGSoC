"use	strict";
"require	view";
"require	form";
"require	fs";
"require	uci";

return view.extend({
	render: function () {
		var m, s, o;

		fs.exec('ls /etc/modules.d/ | grep -E "[0-9]*-ipip"')
			.then(function (res) {
				var output = res.stdout.trim();
				var has_ipip = output.length > 0;
				console.log(has_ipip);
			})
			.catch(function (err) {
				console.error(err);
			});

		m = new form.Map("olsrd", _("OLSR Daemon"), _("The OLSR daemon is an implementation of the Optimized Link State Routing protocol. " + "As such it allows mesh routing for any network equipment. " + "It runs on any wifi card that supports ad-hoc mode and of course on any ethernet device. " + 'Visit <a href="http://www.olsr.org">olsrd.org</a> for help and documentation.'));

		m.on_parse = function () {
			var hasDefaults = false;

			LuCI.uci.sections("olsrd", "InterfaceDefaults", function (s) {
				hasDefaults = true;
				return false;
			});

			if (!hasDefaults) {
				LuCI.uci.add("olsrd", "InterfaceDefaults");
			}
		};

		function write_float(section, value) {
			let n = parseFloat(value);
			if (!isNaN(n)) {
				uci.set("olsrd", section, "name", n.toFixed(1));
			}
		}

		s = m.section(form.TypedSection, "olsrd", translate("General settings"));
		s.anonymous = true;

		s.tab("general", translate("General Settings"));
		s.tab("lquality", translate("Link Quality Settings"));
		s.tab("smartgw", translate("SmartGW"), !has_ipip && translate("Warning: kmod-ipip is not installed. Without kmod-ipip SmartGateway will not work, please install it."));
		s.tab("advanced", translate("Advanced Settings"));

		ipv = s.taboption("general", form.ListValue, "IpVersion", translate("Internet protocol"), translate("IP-version to use. If 6and4 is selected then one olsrd instance is started for each protocol."));
		ipv.value("4", "IPv4");
		ipv.value("6and4", "6and4");

		poll = s.taboption("advanced", form.Value, "Pollrate", translate("Pollrate"), translate("Polling rate for OLSR sockets in seconds. Default is 0.05."));
		poll.optional = true;
		poll.datatype = "ufloat";
		poll.placeholder = "0.05";

		nicc = s.taboption("advanced", form.Value, "NicChgsPollInt", translate("Nic changes poll interval"), translate('Interval to poll network interfaces for configuration changes (in seconds). Default is "2.5".'));
		nicc.optional = true;
		nicc.datatype = "ufloat";
		nicc.placeholder = "2.5";

		tos = s.taboption("advanced", form.Value, "TosValue", translate("TOS value"), translate('Type of service value for the IP header of control traffic. Default is "16".'));
		tos.optional = true;
		tos.datatype = "uinteger";
		tos.placeholder = "16";

		fib = s.taboption("general", form.ListValue, "FIBMetric", translate("FIB metric"), translate("FIBMetric controls the metric value of the host-routes OLSRd sets. " + '"flat" means that the metric value is always 2. This is the preferred value ' + "because it helps the Linux kernel routing to clean up older routes. " + '"correct" uses the hopcount as the metric value. ' + '"approx" uses the hopcount as the metric value too, but does only update the hopcount if the nexthop changes too. ' + 'Default is "flat".'));
		fib.value("flat");
		fib.value("correct");
		fib.value("approx");

		lql = s.taboption("lquality", form.ListValue, "LinkQualityLevel", translate("LQ level"), translate("Link quality level switch between hopcount and cost-based (mostly ETX) routing.<br />" + "<b>0</b> = do not use link quality<br />" + "<b>2</b> = use link quality for MPR selection and routing<br />" + 'Default is "2"'));
		lql.value("2");
		lql.value("0");

		lqage = s.taboption("lquality", form.Value, "LinkQualityAging", translate("LQ aging"), translate("Link quality aging factor (only for lq level 2). Tuning parameter for etx_float and etx_fpm, smaller values " + "mean slower changes of ETX value. (allowed values are between 0.01 and 1.0)"));
		lqage.optional = true;
		lqage.depends("LinkQualityLevel", "2");

		lqa = s.taboption("lquality", form.ListValue, "LinkQualityAlgorithm", translate("LQ algorithm"), translate("Link quality algorithm (only for lq level 2).<br />" + "<b>etx_float</b>: floating point ETX with exponential aging<br />" + "<b>etx_fpm</b>  : same as etx_float, but with integer arithmetic<br />" + "<b>etx_ff</b>   : ETX freifunk, an etx variant which use all OLSR traffic (instead of only hellos) for ETX calculation<br />" + "<b>etx_ffeth</b>: incompatible variant of etx_ff that allows ethernet links with ETX 0.1.<br />" + 'Defaults to "etx_ff"'));
		lqa.optional = true;
		lqa.value("etx_ff");
		lqa.value("etx_fpm");
		lqa.value("etx_float");
		lqa.value("etx_ffeth");
		lqa.depends("LinkQualityLevel", "2");
		lqa.optional = true;

		lqfish = s.taboption("lquality", form.Flag, "LinkQualityFishEye", translate("LQ fisheye"), translate('Fisheye mechanism for TCs (checked means on). Default is "on"'));
		lqfish.default = "1";
		lqfish.optional = true;

		hyst = s.taboption("lquality", form.Flag, "UseHysteresis", translate("Use hysteresis"), translate("Hysteresis for link sensing (only for hopcount metric). Hysteresis adds more robustness to the link sensing " + 'but delays neighbor registration. Defaults is "yes"'));
		hyst.default = "yes";
		hyst.enabled = "yes";
		hyst.disabled = "no";
		hyst.depends("LinkQualityLevel", "0");
		hyst.optional = true;
		hyst.rmempty = true;

		port = s.taboption("general", form.Value, "OlsrPort", translate("Port"), translate("The port OLSR uses. This should usually stay at the IANA assigned port 698. It can have a value between 1 and 65535."));
		port.optional = true;
		port.default = "698";
		port.rmempty = true;

		mainip = s.taboption("general", form.Value, "MainIp", translate("Main IP"), translate("Sets the main IP (originator ip) of the router. This IP will NEVER change during the uptime of olsrd. " + "Default is 0.0.0.0, which triggers usage of the IP of the first interface."));
		mainip.optional = true;
		mainip.rmempty = true;
		mainip.datatype = "ipaddr";
		mainip.placeholder = "0.0.0.0";

		sgw = s.taboption("smartgw", form.Flag, "SmartGateway", translate("Enable"), translate("Enable SmartGateway. If it is disabled, then " + 'all other SmartGateway parameters are ignored. Default is "no".'));
		sgw.default = "no";
		sgw.enabled = "yes";
		sgw.disabled = "no";
		sgw.rmempty = true;

		sgwnat = s.taboption("smartgw", form.Flag, "SmartGatewayAllowNAT", translate("Allow gateways with NAT"), translate("Allow the selection of an outgoing IPv4 gateway with NAT"));
		sgwnat.depends("SmartGateway", "yes");
		sgwnat.default = "yes";
		sgwnat.enabled = "yes";
		sgwnat.disabled = "no";
		sgwnat.optional = true;
		sgwnat.rmempty = true;

		sgwuplink = s.taboption("smartgw", form.ListValue, "SmartGatewayUplink", translate("Announce uplink"), translate("Which kind of uplink is exported to the other mesh nodes. " + 'An uplink is detected by looking for a local HNA of 0.0.0.0/0, ::ffff:0:0/96 or 2000::/3. Default setting is "both".'));
		sgwuplink.value("none");
		sgwuplink.value("ipv4");
		sgwuplink.value("ipv6");
		sgwuplink.value("both");
		sgwuplink.depends("SmartGateway", "yes");
		sgwuplink.default = "both";
		sgwuplink.optional = true;
		sgwuplink.rmempty = true;

		sgwulnat = s.taboption("smartgw", form.Flag, "SmartGatewayUplinkNAT", translate("Uplink uses NAT"), translate("If this Node uses NAT for connections to the internet. " + 'Default is "yes".'));
		sgwulnat.depends("SmartGatewayUplink", "ipv4");
		sgwulnat.depends("SmartGatewayUplink", "both");
		sgwulnat.default = "yes";
		sgwulnat.enabled = "yes";
		sgwulnat.disabled = "no";
		sgwnat.optional = true;
		sgwnat.rmempty = true;

		sgwspeed = s.taboption("smartgw", form.Value, "SmartGatewaySpeed", translate("Speed of the uplink"), translate("Specifies the speed of " + 'the uplink in kilobits/s. First parameter is upstream, second parameter is downstream. Default is "128 1024".'));
		sgwspeed.depends("SmartGatewayUplink", "ipv4");
		sgwspeed.depends("SmartGatewayUplink", "ipv6");
		sgwspeed.depends("SmartGatewayUplink", "both");
		sgwspeed.optional = true;
		sgwspeed.rmempty = true;

		sgwprefix = s.taboption("smartgw", form.Value, "SmartGatewayPrefix", translate("IPv6-Prefix of the uplink"), translate("This can be used " + "to signal the external IPv6 prefix of the uplink to the clients. This might allow a client to change it's local IPv6 address to " + "use the IPv6 gateway without any kind of address translation. The maximum prefix length is 64 bits. " + 'Default is "::/0" (no prefix).'));
		sgwprefix.depends("SmartGatewayUplink", "ipv6");
		sgwprefix.depends("SmartGatewayUplink", "both");
		sgwprefix.optional = true;
		sgwprefix.rmempty = true;

		willingness = s.taboption("advanced", form.ListValue, "Willingness", translate("Willingness"), translate('The fixed willingness to use. If not set willingness will be calculated dynamically based on battery/power status. Default is "3".'));
		for (let i = 0; i < 8; i++) {
			willingness.value(i);
		}
		willingness.optional = true;
		willingness.default = "3";

		natthr = s.taboption("advanced", form.Value, "NatThreshold", translate("NAT threshold"), translate("If the route to the current gateway is to be changed, the ETX value of this gateway is " + "multiplied with this value before it is compared to the new one. " + "The parameter can be a value between 0.1 and 1.0, but should be close to 1.0 if changed.<br />" + "<b>WARNING:</b> This parameter should not be used together with the etx_ffeth metric!<br />" + 'Defaults to "1.0".'));
		for (let i = 1; i >= 0.1; i -= 0.1) {
			natthr.value(i);
		}

		natthr.depends("LinkQualityAlgorithm", "etx_ff");
		natthr.depends("LinkQualityAlgorithm", "etx_float");
		natthr.depends("LinkQualityAlgorithm", "etx_fpm");
		natthr.default = "1.0";
		natthr.optional = true;
		natthr.write = write_float;

		i = m.section(form.TypedSection, "InterfaceDefaults", translate("Interfaces Defaults"));
		i.anonymous = true;
		i.addremove = false;

		i.tab("general", translate("General Settings"));
		i.tab("addrs", translate("IP Addresses"));
		i.tab("timing", translate("Timing and Validity"));

		mode = i.taboption("general", form.ListValue, "Mode", translate("Mode"), translate("Interface mode is used to prevent unnecessary packet forwarding on switched ethernet interfaces. " + 'Valid modes are "mesh" and "ether". Default is "mesh".'));
		mode.value("mesh");
		mode.value("ether");
		mode.optional = true;
		mode.rmempty = true;

		weight = i.taboption("general", form.Value, "Weight", translate("Weight"), translate("When multiple links exist between hosts the weight of interface is used to determine the link to use. " + "Normally the weight is automatically calculated by olsrd based on the characteristics of the interface, " + "but here you can specify a fixed value. Olsrd will choose links with the lowest value.<br />" + "<b>Note:</b> Interface weight is used only when LinkQualityLevel is set to 0. " + "For any other value of LinkQualityLevel, the interface ETX value is used instead."));
		weight.optional = true;
		weight.datatype = "uinteger";
		weight.placeholder = "0";

		lqmult = i.taboption("general", form.DynamicList, "LinkQualityMult", translate("LinkQuality Multiplicator"), translate("Multiply routes with the factor given here. Allowed values are between 0.01 and 1.0. " + "It is only used when LQ-Level is greater than 0. Examples:<br />" + "reduce LQ to 192.168.0.1 by half: 192.168.0.1 0.5<br />" + "reduce LQ to all nodes on this interface by 20%: default 0.8"));
		lqmult.optional = true;
		lqmult.rmempty = true;
		lqmult.cast = "table";
		lqmult.placeholder = "default 1.0";

		lqmult.validate = function (value) {
			for (var i = 0; i < value.length; i++) {
				var v = value[i];
				if (v !== "") {
					var val = v.split(" ");
					var host = val[0];
					var mult = val[1];
					if (!host || !mult) {
						return [null, "LQMult requires two values (IP address or 'default' and multiplicator) separated by space."];
					}
					if (!/^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/.test(host) && host !== "default") {
						return [null, "Can only be a valid IPv4 or IPv6 address or 'default'"];
					}
					if (isNaN(mult) || mult > 1 || mult < 0.01) {
						return [null, "Invalid Value for LQMult-Value. Must be between 0.01 and 1.0."];
					}
					if (!/^[0-1]\.\d+$/.test(mult)) {
						return [null, "Invalid Value for LQMult-Value. You must use a decimal number between 0.01 and 1.0 here."];
					}
				}
			}
			return [value];
		};
		ip4b = i.taboption("addrs", form.Value, "Ip4Broadcast", translate("IPv4 broadcast"), translate("IPv4 broadcast address for outgoing OLSR packets. One useful example would be 255.255.255.255. " + 'Default is "0.0.0.0", which triggers the usage of the interface broadcast IP.'));
		ip4b.optional = true;
		ip4b.datatype = "ip4addr";
		ip4b.placeholder = "0.0.0.0";

		ip6m = i.taboption("addrs", form.Value, "IPv6Multicast", translate("IPv6 multicast"), translate('IPv6 multicast address. Default is "FF02::6D", the manet-router linklocal multicast.'));
		ip6m.optional = true;
		ip6m.datatype = "ip6addr";
		ip6m.placeholder = "FF02::6D";

		ip4s = i.taboption("addrs", form.Value, "IPv4Src", translate("IPv4 source"), translate('IPv4 src address for outgoing OLSR packages. Default is "0.0.0.0", which triggers usage of the interface IP.'));
		ip4s.optional = true;
		ip4s.datatype = "ip4addr";
		ip4s.placeholder = "0.0.0.0";

		ip6s = i.taboption("addrs", form.Value, "IPv6Src", translate("IPv6 source"), translate("IPv6 src prefix. OLSRd will choose one of the interface IPs which matches the prefix of this parameter. " + 'Default is "0::/0", which triggers the usage of a not-linklocal interface IP.'));
		ip6s.optional = true;
		ip6s.datatype = "ip6addr";
		ip6s.placeholder = "0::/0";

		hi = i.taboption("timing", form.Value, "HelloInterval", translate("Hello interval"));
		hi.optional = true;
		hi.datatype = "ufloat";
		hi.placeholder = "5.0";
		hi.write = write_float;

		hv = i.taboption("timing", form.Value, "HelloValidityTime", translate("Hello validity time"));
		hv.optional = true;
		hv.datatype = "ufloat";
		hv.placeholder = "40.0";
		hv.write = write_float;

		ti = i.taboption("timing", form.Value, "TcInterval", translate("TC interval"));
		ti.optional = true;
		ti.datatype = "ufloat";
		ti.placeholder = "2.0";
		ti.write = write_float;

		tv = i.taboption("timing", form.Value, "TcValidityTime", translate("TC validity time"));
		tv.optional = true;
		tv.datatype = "ufloat";
		tv.placeholder = "256.0";
		tv.write = write_float;

		mi = i.taboption("timing", form.Value, "MidInterval", translate("MID interval"));
		mi.optional = true;
		mi.datatype = "ufloat";
		mi.placeholder = "18.0";
		mi.write = write_float;

		mv = i.taboption("timing", form.Value, "MidValidityTime", translate("MID validity time"));
		mv.optional = true;
		mv.datatype = "ufloat";
		mv.placeholder = "324.0";
		mv.write = write_float;

		ai = i.taboption("timing", form.Value, "HnaInterval", translate("HNA interval"));
		ai.optional = true;
		ai.datatype = "ufloat";
		ai.placeholder = "18.0";
		ai.write = write_float;

		av = i.taboption("timing", form.Value, "HnaValidityTime", translate("HNA validity time"));
		av.optional = true;
		av.datatype = "ufloat";
		av.placeholder = "108.0";
		av.write = write_float;

		ifs = m.section(form.TypedSection, "Interface", translate("Interfaces"));
		ifs.addremove = true;
		ifs.anonymous = true;
		ifs.extedit = luci.dispatcher.build_url("admin/services/olsrd/iface/%s");
		ifs.template = "cbi/tblsection";

		ifs.create = function () {
			var sid = uci.add("olsrd", "Interface");
			window.location.href = `${ifs.extedit}${sid}`;
		};
		ign = ifs.option(form.Flag, "ignore", translate("Enable"));
		ign.enabled = "0";
		ign.disabled = "1";
		ign.rmempty = false;
		ign.cfgvalue = function (section_id) {
			return uci.get("olsrd", section_id, "ignore") || "0";
		};

		network = ifs.option(form.DummyValue, "interface", translate("Network"));
		network.template = "cbi/network_netinfo";

		mode = ifs.option(form.DummyValue, "Mode", translate("Mode"));
		mode.cfgvalue = function (section_id) {
			return uci.get("olsrd", section_id, "Mode");
		};

		hello = ifs.option(form.DummyValue, "_hello", translate("Hello"));
		hello.cfgvalue = function (section_id) {
			var i = uci.get("olsrd", section_id, "HelloInterval");
			var v = uci.get("olsrd", section_id, "HelloValidityTime");
			return `${i.toFixed(1)}s / ${v.toFixed(1)}s`;
		};

		tc = ifs.option(form.DummyValue, "_tc", translate("TC"));
		tc.cfgvalue = function (section_id) {
			var i = uci.get("olsrd", section_id, "TcInterval");
			var v = uci.get("olsrd", section_id, "TcValidityTime");
			return `${i.toFixed(1)}s / ${v.toFixed(1)}s`;
		};

		mid = ifs.option(form.DummyValue, "_mid", translate("MID"));
		mid.cfgvalue = function (section_id) {
			var i = uci.get("olsrd", section_id, "MidInterval");
			var v = uci.get("olsrd", section_id, "MidValidityTime");
			return `${i.toFixed(1)}s / ${v.toFixed(1)}s`;
		};

		hna = ifs.option(form.DummyValue, "_hna", translate("HNA"));
		hna.cfgvalue = function (section_id) {
			var i = uci.get("olsrd", section_id, "HnaInterval");
			var v = uci.get("olsrd", section_id, "HnaValidityTime");
			return `${i.toFixed(1)}s / ${v.toFixed(1)}s`;
		};

		return m.render();
	},
});
