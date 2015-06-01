
var socket = null;

var selectedApp = null;

function connect() {
	var host = document.location.hostname;
	if (!host) {
		host = 'localhost';
	}
	if ('WebSocket' in window) {
		socket = new WebSocket('ws://' + host + ':9099');;
	} else if ('MozWebSocket' in window) {
		socket = new WebSocket('');
	} else {
		return;
	}
	socket.onerror = function (event) {
		console.log(event.data);
	}
	socket.onmessage = function (event) {
		createOrUpdateWidget(merge(event.data));
		if (selectedApp) {
			replacePropertyTable(selectedApp);
		}
	}
}

function merge(data) {
	var updateApp = JSON.parse(data);
	var storedApp = localStorage.getItem(updateApp.Id);
	if (storedApp != null) {
		storedApp = JSON.parse(storedApp);
		// Merge values
		storedApp.Status = updateApp.Status;
		storedApp.name = updateApp.name;
		for (var i = 0; i < updateApp.data.length; i++) {
			var found = false;
			for (var j = 0; j < storedApp.data.length; j++) {
				if (storedApp.data[j].name == updateApp.data[i].name) {
					storedApp.data[j].value = updateApp.data[i].value;
					found = true;
					break;
				}
			}
			if (!found) {
				storedApp.data.push(updateApp.data[i]);
			}
		}
		localStorage.setItem(storedApp.Id, JSON.stringify(storedApp));
		if (selectedApp != null && storedApp.Id == selectedApp.Id) {
			selectedApp = storedApp;
		}
		return storedApp;
	} else {
		localStorage.setItem(updateApp.Id, data);
		return updateApp;
	}
}

function init() {
	connect();
}

function createElement(tag, id, clazz, text) {
	var element = document.createElement(tag);
	if (id) {
		element.id = id;
	}
	if (clazz) {
		element.className = clazz;
	}
	if (text) {
		element.appendChild(document.createTextNode(text));
	}
	return element;
}

function createOrUpdateWidget(app) {
	if (!document.getElementById(app.Id)) {
		createWidget(app);
	}
	updateWidget(app);
}

function createWidget(app) {
	var widget = createElement('div', app.Id, 'w');
	var canvas = document.createElement('canvas');
	canvas.id = app.Id + '-canvas';
	canvas.width = 240;	canvas.height = 160;
	canvas.style.zIndex = 0; canvas.style.position = 'absolute';
	widget.appendChild(canvas);
	widget.appendChild(createElement('p', app.Id + '-name', 'name'));
	widget.appendChild(createElement('p', app.Id + '-type', 'id'));
	widget.appendChild(createElement('p', app.Id + '-id'  , 'id'));
	var table = createWidgetPropertyTable(app);
	widget.appendChild(table);
	widget.setAttribute('onclick', 'select(this);');
	document.getElementById('widgetBoard').appendChild(widget);
}

function createWidgetPropertyTable(app) {
	var table = createElement('table');
	var row;
	for (var i = 0; i < 3; i++) {
		row = createElement('tr');
		row.appendChild(createElement('td', app.Id + '-wpk-' + i, 'key'));
		row.appendChild(createElement('td', app.Id + '-wpv-' + i, ''));
		table.appendChild(row);
	}
	return table;
}

function updateText(node, text) {
	if (node.childNodes.length == 0) {
		node.appendChild(document.createTextNode(text));
	} else {
		node.childNodes[0].nodeValue = text;
	}
}

function updateWidget(app) {
	// update text
	updateText(document.getElementById(app.Id + '-name'), app.Name);
	updateText(document.getElementById(app.Id + '-type'), 'Type: ' + app.Type);
	updateText(document.getElementById(app.Id + '-id'), 'ID: ' + app.Id);
	
	// update widget property table
	var j = 0; var n; var v;
	for (var i = 0; i < 3; i++) {
		n = ''; v = '';
		while (j < app.data.length) {
			j++;
			if (app.data[j - 1].show == 'true') {
				n = app.data[j - 1].name;
				v = app.data[j - 1].value;
				break;
			}
		}
		updateText(document.getElementById(app.Id + '-wpk-' + i), n);
		updateText(document.getElementById(app.Id + '-wpv-' + i), v);
	}
	
	// draw status icon
	var canvas = document.getElementById(app.Id + '-canvas');
	checkPropertiesRanges(app);
	drawStatus(canvas.getContext('2d'), app.Status);
}

function checkPropertiesRanges(app) {

	if (!app.ranges) {
		return;
	}
	for (var i = 0; i < app.data.length; i++) {
		var min = app.ranges[app.Id + '-pmin-' + app.data[i].name];
		var max = app.ranges[app.Id + '-pmax-' + app.data[i].name];
		var v = parseFloat(app.data[i].value);
		if (min) {
			min = parseFloat(min);
			if (v < min) {
				app.Status = 'NOK';
				break;
			}
		}
		if (max) {
			max = parseFloat(max);
			if (v > max) {
				app.Status = 'NOK';
				break;
			}
		}
		app.Status = 'OK';
	}
	
}

function replacePropertyTable(app) {
	
	var div   = createElement(  'div', null,             'r');
	var table = createElement('table', null,    'properties');
	var tr    = createElement(   'tr');
	var top   = createElement(   'th', null, 'propertiestop');
	top.colSpan   = '5';
	top.innerHTML = 'Properties for application <b>' + app.Name + '</b>';
	tr.appendChild(top)
	table.appendChild(tr);
	div.appendChild(table);
	
	var th; var td; var d; var input;
	
	tr = createElement('tr');
	th = createElement('th', null, 'properties');
	tr.appendChild(th);
	th = createElement('th', null, 'properties', 'Property');
	tr.appendChild(th);
	th = createElement('th', null, 'properties', 'Value');
	th.colSpan = 3
	tr.appendChild(th);
	table.appendChild(tr);
	
	for (var i = 0; i < app.data.length; i++) {
		tr = createElement('tr');
		td = createElement('td', null, 'Properties');
		var style = 'check';
		if (app.data[i].show == 'true') {
			style = 'checks';
		}
		d = createElement('div', app.Id + '-pcb-' + i, style);
		d.setAttribute('onclick', 'selectbox(this);');
		td.appendChild(d);
		tr.appendChild(td);
		
		td = createElement('td', null, 'properties',app.data[i].name);
		tr.appendChild(td);
		
		td = createElement('td', null, 'propertiesvalue',app.data[i].value);
		tr.appendChild(td);
		
		if (app.data[i].type == 'V') {
			td = createElement('td', null, 'propertiesvalue');
			td.style.width='15%';
			input = createElement('input', app.Id + '-pmin-' + app.data[i].name, 'properties');
			input.title = 'Min';
			if (app.ranges) {
				if (app.ranges[app.Id + '-pmin-' + app.data[i].name]) {
					input.value = app.ranges[app.Id + '-pmin-' + app.data[i].name];
				}
			}
			input.setAttribute('onkeyup', 'editRange(this);');
			td.appendChild(input);
			tr.appendChild(td);
			td = createElement('td', null, 'propertiesvalue');
			td.style.width='15%';
			input = createElement('input', app.Id + '-pmax-' + app.data[i].name, 'properties');
			input.title = 'Max';
			if (app.ranges) {
				if (app.ranges[app.Id + '-pmax-' + app.data[i].name]) {
					input.value = app.ranges[app.Id + '-pmax-' + app.data[i].name];
				}
			}
			input.setAttribute('onkeyup', 'editRange(this);');
			td.appendChild(input);
			tr.appendChild(td);
		} else if (app.data[i].type == 'S') {
			td = createElement('td', null, 'propertiesvalue');
			td.colSpan = 2;
			input = createElement('input', app.Id + '-pattern-' + app.data[i].name, 'properties');
			input.title = 'Pattern';
			if (app.ranges) {
				if (app.ranges[app.Id + '-pattern-' + app.data[i].name]) {
					input.value = app.ranges[app.Id + '-pattern-' + app.data[i].name]
				}
			}
			input.setAttribute('onkeyup', 'editRange(this);');
			td.appendChild(input);
			tr.appendChild(td);
		} else {
			td = createElement('td', null, 'propertiesvalue');
			td.style.width='15%';
			tr.appendChild(td);
			td = createElement('td', null, 'propertiesvalue');
			td.style.width='15%';
			tr.appendChild(td);
		}
		
		table.appendChild(tr);
	}
	
	// replace existing table
	var existingTable = document.getElementsByClassName('r')[0];
	existingTable.parentNode.replaceChild(div, existingTable);
}
	
function select(element) {
	var widgets = document.getElementsByClassName('ws');
	for (var i = 0; i < widgets.length; i++) {
		widgets[i].className = 'w'
	}
	element.className = 'ws';
	if (selectedApp) {
		localStorage.setItem(selectedApp.Id, JSON.stringify(selectedApp));
	}
	selectedApp = JSON.parse(localStorage.getItem(element.id));
	replacePropertyTable(selectedApp);
	updateBoxSelection();
}

function selectbox(element) {
	var i = element.id.indexOf('-pcb-');
	var id = element.id.substring(0, i);
	var j = parseInt(element.id.substring(i + 5), 10);
	var app = selectedApp;
	if (element.className == 'check') {
		element.className = 'checks';
		app.data[j]['show'] = 'true';
	} else {
		element.className = 'check';
		app.data[j]['show'] = 'false';
	}
	localStorage.setItem(selectedApp.Id, JSON.stringify(selectedApp));
	updateBoxSelection();
	createOrUpdateWidget(app);
}

function updateBoxSelection() {
	var checked = document.getElementsByClassName('checks');
	if (checked.length >= 3) {
		var unchecked = document.getElementsByClassName('check');
		for (var i = 0; i < unchecked.length; i++) {
			unchecked[i].style.visibility = 'hidden';
		}
	} else {
		var unchecked = document.getElementsByClassName('check');
		for (var i = 0; i < unchecked.length; i++) {
			unchecked[i].style.visibility = 'initial';
		}
	}
}

function editRange(element) {
	if (!selectedApp.ranges) {
		selectedApp.ranges = {};
	}
	selectedApp.ranges[element.id] = element.value;
	createOrUpdateWidget(selectedApp);
}

function drawStatus(ctx, status) {

	var x; var y;
	var r1; var r2; var r3;
	var color;
	
	if (status == 'OK') {
		x = 0; y = 160;
		r1 = 28; r2 = 20; r3 = 16;
		color = '#44CC44';
	} else if (status == 'NOK') {
		x = 240; y = 0;
		r1 = 56; r2 = 40; r3 = 32;
		color = '#CC4444';
	} else {
		return;
	}
	
	ctx.clearRect(0,0,240,160);
	
	ctx.beginPath();
	ctx.globalCompositeOperation = 'source-over'
	ctx.fillStyle = color;
	ctx.arc(x, y, r1, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.globalCompositeOperation = 'destination-out'
	ctx.fillStyle = '#ffffff';
	ctx.arc(x, y, r2, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.globalCompositeOperation = 'source-over'
	ctx.fillStyle = color;
	ctx.arc(x, y, r3, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
}
