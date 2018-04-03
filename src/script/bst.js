function BST(compare) {
    
    var KEY         = 0;
    var VAL         = 1;
    var LEFT        = 2;
    var RIGHT       = 3;
	
    var N = 0;
    var root = null;
    
    function kv(node) {
        return {
            key: node[KEY], 
            val: node[VAL]
        };
    };

    this.size = function() {return N;};
    this.isEmpty = function() {return N === 0;};

    this.get = function(key) {
        var get0 = function(key, node) {
            if (node === null)
                return null;
            var cmp = compare(key, node[KEY]);
            if (cmp < 0)
                return get0(key, node[LEFT]);
            else if (cmp > 0)
                return get0(key, node[RIGHT]);
            else 
                return node[VAL];
        };
        return get0(key, root);
    };

    this.put = function(key, val) {
        var put0 = function(key, val, node) {
            if (node === null) {
                N++;
                return [key, val, null, null];
            }
            var cmp = compare(key, node[KEY]);
            if (cmp < 0)
                node[LEFT] = put0(key, val, node[LEFT]);
            else if (cmp > 0)
                node[RIGHT] = put0(key, val, node[RIGHT]);
            else 
                node[VAL] = val;
            return node;
        };
        root = put0(key, val, root);
    };

    this.remove = function(key) {
        var remove0 = function(key, node) {
            if (node === null)
                return null;
            var cmp = compare(key, node[KEY]);
            if (cmp < 0)
                node[LEFT] = remove0(key, node[LEFT]);
            else if (cmp > 0)
                node[RIGHT] = remove0(key, node[RIGHT]);
            else {
                N--;
                var temp = {};
                node = extractMin0(node[RIGHT], temp);
                node[KEY] = temp.key;
                node[VAL] = temp.val;
            }
            return node;
        };
        root = remove0(key, root);
    };

    this.min = function() {
        var min0 = function(node) {
            return node[LEFT] === null ? kv(node) : min0(node[LEFT]);
        };
        return root === null ? null : min0(root);
    };

    this.max = function() {
        var max0 = function(node) {
            return node[RIGHT] === null ? kv(node) : max0(node[RIGHT]);
        };
        return root === null ? null : max0(root);
    };
    
    function extractMin0(node, temp) {
        var extractMin1 = function(node, temp) {
            if (node[LEFT] === null) {
                temp.key = node[KEY];
                temp.val = node[VAL];
                return node[RIGHT];
            }
            node[LEFT] = extractMin1(node[LEFT], temp);
            return node;
        };
        return node === null ? null : extractMin1(node, temp); 
    };
    
    function extractMax0(node, temp) {
        var extractMax1 = function(node, temp) {
            if (node[RIGHT] === null) {
                temp.key = node[KEY];
                temp.val = node[VAL];
                return node[LEFT];
            }
            node[RIGHT] = extractMax1(node[RIGHT], temp);
            return node;
        };
        return node === null ? null : extractMax1(node, temp);
    };
        
    this.extractMin = function() {
        var temp = {};
        root = extractMin0(root, temp);
        return temp;
    };    
    
    this.extractMax = function() {
        var temp = {};
        root = extractMax0(root, temp);
        return temp;
    };  
    
}

