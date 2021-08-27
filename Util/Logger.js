class Logger {
	
	constructor(level, baseDir, removeSensibleData = (str) => { return str; }) {
		_level = level;
		_baseDir = baseDir;
		_removeSensibleData = removeSensibleData;
	}
	
	debug(message) {
		if (_level == 0) logToConsole(message);
	}
	info(message) {
		if (_level <= 1) logToConsole(message);
	}
	log(message) {
		if (_level <= 2) logToConsole(message);
	}
	error(message) {
		if (_level <= 3) logToConsole(message);
	}
}

var _level = 0;
var _baseDir = '';
var _removeSensibleData;

function logToConsole(message) {
	let stack = (new Error()).stack;
	let type = stack.split('\n')[2].split(' ')[5].split('.')[1];
	let name;
	let file;
	try {
		let frag = stack.split('\n')[3].split(' ');
		name = frag[5];
		file = frag[6].split(")")[0].replace('(' + _baseDir, '');
	}
	catch (e) {
		name = stack.split('\n')[4].split(' ')[5];
		file = stack.split('\n')[3].split(' ')[5].replace(_baseDir, '');
	}
	console[type](_removeSensibleData(`[${type[0].toUpperCase()}] ${(new Date()).toISOString()} [${file} ${name}] ${message}`));
}

module.exports = Logger;