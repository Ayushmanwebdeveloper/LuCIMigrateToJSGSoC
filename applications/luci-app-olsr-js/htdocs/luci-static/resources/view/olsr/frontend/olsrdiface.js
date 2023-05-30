"use strict";
"require view";
"require form";
"require	uci";

return view.extend({
	render: function () {
		function write_float(section_id, value) {
			let n = parseFloat(value);
			if (!isNaN(n)) {
				uci.set("olsrd", section_id, "name", n.toFixed(1));
			}
		}

		m = new form.Map("olsrd", _("OLSR Daemon - Interface"), _("The OLSR daemon is an implementation of the Optimized Link State Routing protocol. " + "As such it allows mesh routing for any network equipment. " + "It runs on any wifi card that supports ad-hoc mode and of course on any ethernet device. " + "Visit <a href='http://www.olsr.org'>olsrd.org</a> for help and documentation."));

		m.redirect = "admin/services/olsrd"; 

		// if (!process.argv[2] || uci.get("olsrd","main", process.argv[2])!== "Interface") {
		// 	window.location.href = m.redirect;
		// 	return;
		// }

		i = m.section(form.NamedSection, arg[1], "Interface", _("Interface"));
		i.anonymous = true;
		i.addremove = false;

		i.tab("general", _("General Settings"));
		i.tab("addrs", _("IP Addresses"));
		i.tab("timing", _("Timing and Validity"));

		ign = i.taboption("general", form.Flag, "ignore", _("Enable"), _("Enable this interface."));
		ign.enabled = "0";
		ign.disabled = "1";
		ign.rmempty = false;

		ign.cfgvalue = function (section_id) {
			return Flag.cfgvalue(section_id) || "0";
		};

		network = i.taboption("general", form.Value, "interface", _("Network"), _("The interface OLSRd should serve."));

		network.template = "cbi/network_netlist";
		network.widget = "radio";
		network.nocreate = true;

		mode = i.taboption("general", form.ListValue, "Mode", _("Mode"), _("Interface mode is used to prevent unnecessary packet forwarding on switched ethernet interfaces. " + 'Valid modes are "mesh" and "ether". Default is "mesh".'));
		mode.value("mesh");
		mode.value("ether");
		mode.optional = true;
		mode.rmempty = true;

		weight = i.taboption("general", form.Value, "Weight", _("Weight"), _("When multiple links exist between hosts the weight of interface is used to determine the link to use. " + "Normally the weight is automatically calculated by olsrd based on the characteristics of the interface, " + "but here you can specify a fixed value. Olsrd will choose links with the lowest value.<br />" + "<b>Note:</b> Interface weight is used only when LinkQualityLevel is set to 0. " + "For any other value of LinkQualityLevel, the interface ETX value is used instead."));
		weight.optional = true;
		weight.datatype = "uinteger";
		weight.placeholder = "0";

		lqmult = i.taboption("general", form.DynamicList, "LinkQualityMult", _("LinkQuality Multiplicator"), _("Multiply routes with the factor given here. Allowed values are between 0.01 and 1.0. " + "It is only used when LQ-Level is greater than 0. Examples:<br />" + "reduce LQ to 192.168.0.1 by half: 192.168.0.1 0.5<br />" + "reduce LQ to all nodes on this interface by 20%: default 0.8"));
		lqmult.optional = true;
		lqmult.rmempty = true;
		lqmult.cast = "table";
		lqmult.placeholder = "default 1.0";

		lqmult.validate = function (value) {
			for (let i = 0; i < value.length; i++) {
				const v = value[i];
				if (v !== "") {
					const val = v.split(" ");
					const host = val[0];
					const mult = val[1];
					if (!host || !mult) {
						return [null, _("LQMult requires two values (IP address or 'default' and multiplicator) separated by space.")];
					}
					if (!(host === "default" || !/^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/.test(host))) {
						return [null, _("Can only be a valid IPv4 or IPv6 address or 'default'")];
					}
					if (!parseFloat(mult) || parseFloat(mult) > 1 || parseFloat(mult) < 0.01) {
						return [null, _("Invalid Value for LQMult-Value. Must be between 0.01 and 1.0.")];
					}
					if (!mult.match(/[0-1]\.[0-9]+/)) {
						return [null, _("Invalid Value for LQMult-Value. You must use a decimal number between 0.01 and 1.0 here.")];
					}
				}
			}
			return [value];
		};

		ip4b = i.taboption("addrs", form.Value, "Ip4Broadcast", _("IPv4 broadcast"), _("IPv4 broadcast address for outgoing OLSR packets. One useful example would be 255.255.255.255. " + 'Default is "0.0.0.0", which triggers the usage of the interface broadcast IP.'));
		ip4b.optional = true;
		ip4b.datatype = "ip4addr";
		ip4b.placeholder = "0.0.0.0";

		ip6m = i.taboption("addrs", form.Value, "IPv6Multicast", _("IPv6 multicast"), _('IPv6 multicast address. Default is "FF02::6D", the manet-router linklocal multicast.'));
		ip6m.optional = true;
		ip6m.datatype = "ip6addr";
		ip6m.placeholder = "FF02::6D";

		ip4s = i.taboption("addrs", form.Value, "IPv4Src", _("IPv4 source"), _('IPv4 src address for outgoing OLSR packages. Default is "0.0.0.0", which triggers usage of the interface IP.'));
		ip4s.optional = true;
		ip4s.datatype = "ip4addr";
		ip4s.placeholder = "0.0.0.0";

		ip6s = i.taboption("addrs", form.Value, "IPv6Src", _("IPv6 source"), _("IPv6 src prefix. OLSRd will choose one of the interface IPs which matches the prefix of this parameter. " + 'Default is "0::/0", which triggers the usage of a not-linklocal interface IP.'));
		ip6s.optional = true;
		ip6s.datatype = "ip6addr";
		ip6s.placeholder = "0::/0";

		hi = i.taboption("timing", form.Value, "HelloInterval", _("Hello interval"));
		hi.optional = true;
		hi.datatype = "ufloat";
		hi.placeholder = "5.0";
		hi.write = write_float;

		hv = i.taboption("timing", form.Value, "HelloValidityTime", _("Hello validity time"));
		hv.optional = true;
		hv.datatype = "ufloat";
		hv.placeholder = "40.0";
		hv.write = write_float;

		ti = i.taboption("timing", form.Value, "TcInterval", _("TC interval"));
		ti.optional = true;
		ti.datatype = "ufloat";
		ti.placeholder = "2.0";
		ti.write = write_float;

		tv = i.taboption("timing", form.Value, "TcValidityTime", _("TC validity time"));
		tv.optional = true;
		tv.datatype = "ufloat";
		tv.placeholder = "256.0";
		tv.write = write_float;

		mi = i.taboption("timing", form.Value, "MidInterval", _("MID interval"));
		mi.optional = true;
		mi.datatype = "ufloat";
		mi.placeholder = "18.0";
		mi.write = write_float;

		mv = i.taboption("timing", form.Value, "MidValidityTime", _("MID validity time"));
		mv.optional = true;
		mv.datatype = "ufloat";
		mv.placeholder = "324.0";
		mv.write = write_float;

		ai = i.taboption("timing", form.Value, "HnaInterval", _("HNA interval"));
		ai.optional = true;
		ai.datatype = "ufloat";
		ai.placeholder = "18.0";
		ai.write = write_float;

		av = i.taboption("timing", form.Value, "HnaValidityTime", _("HNA validity time"));
		av.optional = true;
		av.datatype = "ufloat";
		av.placeholder = "108.0";
		av.write = write_float;

		return m.render();
	},
});
