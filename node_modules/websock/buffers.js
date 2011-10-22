var EMPTY = new Buffer(0);

var BufferList = function() {
	this.length = 0;

	this._list = [];
	this._offset = 0;
};

BufferList.prototype.push = function(buf) {
	if (!buf.length) {
		return;
	}
	this._list.push(buf);

	this.length += buf.length;
};
BufferList.prototype.shift = function() {	
	var b = this._list[0] && this._list[0][this._offset++];

	this.length--;

	if (this._offset >= (this._list[0] && this._list[0].length)) {
		this._list.shift();
		this._offset = 0;
	}
	return b;
};
BufferList.prototype.join = function() {
	var list = this._list;

	if (!list.length) {
		return EMPTY;
	}
	var first = this._offset ? list[0].slice(this._offset) : list[0];

	if (list.length === 1) {
		return first;
	}

	var all = new Buffer(this.length);
	var offset = 0;

	list[0] = first;

	for (var i = 0; i < list.length; i++) {
		list[i].copy(all, offset);
		offset += list[i].length
	}
	return all;
};
BufferList.prototype.empty = function(length) {
	var first = this._list[0];

	if (length && (this._offset + length < first.length)) {
		var b = first.slice(this._offset, this._offset+length);

		this._offset += length;
		this.length -= length;
		return b;
	}
	var all = this.join();

	this.length = 0;

	this._list = [];
	this._offset = 0;

	if (!length) {
		return all;
	}

	this.push(all.slice(length));
	return all.slice(0, length);
};

exports.create = function() {
	return new BufferList();
};
