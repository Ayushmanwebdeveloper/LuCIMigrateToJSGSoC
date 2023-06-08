function etx_color(etx) {
	let color = "#bb3333";
	if (etx === 0) {
			color = "#bb3333";
	} else if (etx < 2) {
			color = "#00cc00";
	} else if (etx < 4) {
			color = "#ffcb05";
	} else if (etx < 10) {
			color = "#ff6600";
	}
	return color;
}

function snr_color(snr) {
	let color = "#bb3333";
	if (snr === 0) {
			color = "#bb3333";
	} else if (snr > 30) {
			color = "#00cc00";
	} else if (snr > 20) {
			color = "#ffcb05";
	} else if (snr > 5) {
			color = "#ff6600";
	}
	return color;
}
