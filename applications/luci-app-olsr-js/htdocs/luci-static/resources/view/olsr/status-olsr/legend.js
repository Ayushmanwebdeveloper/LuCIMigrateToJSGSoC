'use strict';
'require uci';
'require view';

return view.extend({
   
    render: () => {
				return E('div', {}, [
					E('h3', {}, [_('Legend') + ':']),
					E('ul', {}, [
							E('li', {}, [
									E('strong', {}, [_('LQ: ')]),
									_('Success rate of packages received from the neighbour')
							]),
							E('li', {}, [
									E('strong', {}, [_('NLQ: ')]),
									_('Success rate of packages sent to the neighbour')
							]),
							E('li', {}, [
									E('strong', {}, [_('ETX: ')]),
									_('Expected retransmission count')
							]),
							E('li', { style: 'list-style: none' }, [
									E('ul', {}, [
											E('li', {}, [
													E('strong', { style: 'color:#00cc00' }, [_('Green')]),
													':',
													_('Very good (ETX < 2)')
											]),
											E('li', {}, [
													E('strong', { style: 'color:#ffcb05' }, [_('Yellow')]),
													':',
													_('Good (2 < ETX < 4)')
											]),
											E('li', {}, [
													E('strong', { style: 'color:#ff6600' }, [_('Orange')]),
													':',
													_('Still usable (4 < ETX < 10)')
											]),
											E('li', {}, [
													E('strong', { style: 'color:#bb3333' }, [_('Red')]),
													':',
													_('Bad (ETX > 10)')
											])
									])
							]),
							E('li', {}, [
									E('strong', {}, [_('SNR: ')]),
									_('Signal Noise Ratio in dB')
							]),
							E('li', { style: 'list-style: none' }, [
									E('ul', {}, [
											E('li', {}, [
													E('strong', { style: 'color:#00cc00' }, [_('Green')]),
													':',
													_('Very good (SNR > 30)')
											]),
											E('li', {}, [
													E('strong', { style: 'color:#ffcb05' }, [_('Yellow')]),
													':',
													_('Good (30 > SNR > 20)')
											]),
											E('li', {}, [
													E('strong', { style: 'color:#ff6600' }, [_('Orange')]),
													':',
													_('Still usable (20 > SNR > 5)')
											]),
											E('li', {}, [
													E('strong', { style: 'color:#bb3333' }, [_('Red')]),
													':',
													_('Bad (SNR < 5)')
											])
									])
							])
					])
			]);
								
    }
})
