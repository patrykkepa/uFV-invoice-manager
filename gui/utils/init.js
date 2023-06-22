const welcome = require('cli-welcome');
const pkg = require('./../package.json');
const unhandled = require('cli-handle-unhandled');

module.exports = ({ clear = true }) => {
	unhandled();
	welcome({
		title: `            uFV - FV Manager            `,
		tagLine: ``,
		// description: '------------------------------------------',
		description: '',
		version: `${pkg.version}\n`,
		bgColor: '#ffffffff',
		color: '#ffffff',
		bold: true,
		clear
	});
};
