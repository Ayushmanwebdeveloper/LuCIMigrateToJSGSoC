'use strict';
'require view';
'require form';
'require	uci';
'require validation';
'require network';

return view.extend({
	render: function () {
		if (arg[1]) {
			mp = new form.Map('olsrd6', _('OLSR - Plugins'));

			p = mp.section(form.TypedSection, 'LoadPlugin', _('Plugin configuration'));
			p.depends('library', arg[1]);
			p.anonymous = true;

			ign = p.option(form.Flag, 'ignore', _('Enable'));
			ign.enabled = '0';
			ign.disabled = '1';
			ign.rmempty = false;
			ign.cfgvalue = function (section_id) {
				return uci.get('olsrd', section_id, 'ignore') || '0';
			};

			lib = p.option(form.DummyValue, 'library', _('Library'));
			lib.default = arg[1];

			function Range(x, y) {
				var t = [];
				for (var i = x; i <= y; i++) {
					t.push(i);
				}
				return t;
			}

			function Cidr2IpMask(val) {
				function prefixToMask(prefix, isIPv6) {
					return isIPv6 ? network.prefixToMask(prefix, true) : LuCI.network.prefixToMask(prefix, false);
				}

				if (val) {
					for (let i = 0; i < val.length; i++) {
						let cidr = val[i];

						if (validation.cidr(cidr)) {
							const [ip, prefix] = cidr.split('/');
							let network, mask;

							if (validation.ip6addr(ip)) {
								network = ip;
								mask = prefixToMask(parseInt(prefix), true);
							} else if (validation.ip4addr(ip)) {
								network = ip;
								mask = prefixToMask(parseInt(prefix), false);
							}

							if (network && mask) {
								val[i] = network + ' ' + mask;
							}
						}
					}
				}
				return val;
			}

			function IpMask2Cidr(val) {
				if (val) {
					for (let i = 0; i < val.length; i++) {
						const [ip, mask] = val[i].match(/([^ ]+)%s+([^ ]+)/) || [];
						let cidr;

						if (ip && mask) {
							if (validation.ip6addr(ip)) {
								cidr = ip + '/' + mask;
							} else if (validation.ip4addr(ip)) {
								const ipParts = ip.split('.');
								const maskParts = mask.split('.');
								let cidrParts = [];

								for (let j = 0; j < 4; j++) {
									const ipPart = parseInt(ipParts[j]);
									const maskPart = parseInt(maskParts[j]);
									const cidrPart = ipPart & maskPart;
									cidrParts.push(cidrPart);
								}

								const cidrPrefix = network.maskToPrefix(maskParts.join('.'));
								cidr = cidrParts.join('.') + '/' + cidrPrefix;
							}
						}

						if (cidr) {
							val[i] = cidr;
						}
					}
				}

				return val;
			}

			const knownPlParams = {
				olsrd_bmf: [
					[form.Value, 'BmfInterface', 'bmf0'],
					[form.Value, 'BmfInterfaceIp', '10.10.10.234/24'],
					[form.Flag, 'DoLocalBroadcast', 'no'],
					[form.Flag, 'CapturePacketsOnOlsrInterfaces', 'yes'],
					[form.ListValue, 'BmfMechanism', ['UnicastPromiscuous', 'Broadcast']],
					[form.Value, 'BroadcastRetransmitCount', '2'],
					[form.Value, 'FanOutLimit', '4'],
					[form.DynamicList, 'NonOlsrIf', 'br-lan'],
				],
				olsrd_dyn_gw: [
					[form.Value, 'Interval', '40'],
					[form.DynamicList, 'Ping', '141.1.1.1'],
					[form.DynamicList, 'HNA', '192.168.80.0/24', IpMask2Cidr, Cidr2IpMask],
				],
				olsrd_httpinfo: [
					[form.Value, 'port', '80'],
					[form.DynamicList, 'Host', '163.24.87.3'],
					[form.DynamicList, 'Net', '0.0.0.0/0', Cidr2IpMask],
				],
				olsrd_nameservice: [
					[form.DynamicList, 'name', 'my-name.mesh'],
					[form.DynamicList, 'hosts', '1.2.3.4 name-for-other-interface.mesh'],
					[form.Value, 'suffix', '.olsr'],
					[form.Value, 'hosts_file', '/path/to/hosts_file'],
					[form.Value, 'add_hosts', '/path/to/file'],
					[form.Value, 'dns_server', '141.1.1.1'],
					[form.Value, 'resolv_file', '/path/to/resolv.conf'],
					[form.Value, 'interval', '120'],
					[form.Value, 'timeout', '240'],
					[form.Value, 'lat', '12.123'],
					[form.Value, 'lon', '12.123'],
					[form.Value, 'latlon_file', '/var/run/latlon.js.ipv6'],
					[form.Value, 'latlon_infile', '/var/run/gps.txt'],
					[form.Value, 'sighup_pid_file', '/var/run/dnsmasq.pid'],
					[form.Value, 'name_change_script', '/usr/local/bin/announce_new_hosts.sh'],
					[form.DynamicList, 'service', 'http://me.olsr:80|tcp|my little homepage'],
					[form.Value, 'services_file', '/var/run/services_olsr'],
					[form.Value, 'services_change_script', '/usr/local/bin/announce_new_services.sh'],
					[form.DynamicList, 'mac', 'xx:xx:xx:xx:xx:xx[,0-255]'],
					[form.Value, 'macs_file', '/path/to/macs_file'],
					[form.Value, 'macs_change_script', '/path/to/script'],
				],
				olsrd_quagga: [
					[StaticList, 'redistribute', ['system', 'kernel', 'connect', 'static', 'rip', 'ripng', 'ospf', 'ospf6', 'isis', 'bgp', 'hsls']],
					[form.ListValue, 'ExportRoutes', ['only', 'both']],
					[form.Flag, 'LocalPref', 'true'],
					[form.Value, 'Distance', Range(0, 255)],
				],
				olsrd_secure: [[form.Value, 'Keyfile', '/etc/private-olsr.key']],
				olsrd_txtinfo: [[form.Value, 'accept', '::1/128']],
				olsrd_jsoninfo: [
					[form.Value, 'accept', '::1/128'],
					[form.Value, 'port', '9090'],
					[form.Value, 'UUIDFile', '/etc/olsrd/olsrd.uuid.ipv6'],
				],
				olsrd_watchdog: [
					[form.Value, 'file', '/var/run/olsrd.watchdog.ipv6'],
					[form.Value, 'interval', '30'],
				],
				olsrd_mdns: [[form.DynamicList, 'NonOlsrIf', 'lan']],
				olsrd_p2pd: [
					[form.DynamicList, 'NonOlsrIf', 'lan'],
					[form.Value, 'P2pdTtl', '10'],
				],
				olsrd_arprefresh: [],
				olsrd_dot_draw: [],
				olsrd_dyn_gw_plain: [],
				olsrd_pgraph: [],
				olsrd_tas: [],
			};

			if (knownPlParams[arg[1]]) {
				for (const option of knownPlParams[arg[1]]) {
					const [otype, name, defaultVal, uci2cbi, cbi2uci] = option;
					let values;

					if (Array.isArray(defaultVal)) {
						values = defaultVal;
						defaultVal = defaultVal[0];
					}

					if (otype === form.Flag) {
						const bool = p.option(form.Flag, name, name);
						if (defaultVal === 'yes' || defaultVal === 'no') {
							bool.enabled = 'yes';
							bool.disabled = 'no';
						} else if (defaultVal === 'on' || defaultVal === 'off') {
							bool.enabled = 'on';
							bool.disabled = 'off';
						} else if (defaultVal === '1' || defaultVal === '0') {
							bool.enabled = '1';
							bool.disabled = '0';
						} else {
							bool.enabled = 'true';
							bool.disabled = 'false';
						}
						bool.optional = true;
						bool.default = defaultVal;
						// bool.depends({ library: plugin });
					} else {
						const field = p.option(otype, name, name);
						if (values) {
							for (const value of values) {
								field.value(value);
							}
						}
						if (typeof uci2cbi === 'function') {
							field.cfgvalue = function (section) {
								return uci2cbi(otype.cfgvalue(this, section));
							};
						}
						if (typeof cbi2uci === 'function') {
							field.formvalue = function (section) {
								return cbi2uci(otype.formvalue(this, section));
							};
						}
						field.optional = true;
						field.default = defaultVal;
						//field.depends({ library: plugin });
					}
				}
			}

			return mp;
		} else {
			mpi = new form.Map('olsrd6', _('OLSR - Plugins'));

			const plugins = {};
			uci.sections('olsrd6', 'LoadPlugin', (section) => {
				if (section.library && !plugins[section.library]) {
					plugins[section.library] = true;
				}
			});

			// Create a loadplugin section for each found plugin
			fs.list('/usr/lib').forEach((v) => {
				if (v.substr(0, 6) === 'olsrd_') {
					v = v.match(/^(olsrd_.*)\.so\..*/)[1];
					if (!plugins[v]) {
						var sid = uci.add('olsrd6', 'LoadPlugin');
						uci.set('olsrd6', sid, 'ignore', '1');
						uci.set('olsrd6', sid, 'library', v);
					}
				}
			});

			t = mpi.section(TypedSection, 'LoadPlugin', _('Plugins'));
			t.anonymous = true;
			t.template = 'cbi/tblsection';
			t.override_scheme = true;

			t.extedit = function (section_id) {
				var lib = uci.get(section_id, 'library') || '';
				return '/cgi-bin/luci/admin/services/olsrd6/plugins/' + lib;
			};
			ign = t.option(Flag, 'ignore', _('Enabled'));
			ign.enabled = '0';
			ign.disabled = '1';
			ign.rmempty = false;
			function ign_cfgvalue(section_id) {
				return uci.get(section_id, 'ignore') || '0';
			}

			t.option(DummyValue, 'library', _('Library'));

			return mpi.render();
		}
	},
});
