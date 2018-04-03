function AStarPathSearch(graph, w, h, source, dest) {
    var parentOf = [];
    var distanceTo = [];
    var pq = new BST(function(w1, w2) {
		if (w1 < w2)
			return -1;
		else if (w1 > w2)
			return 1;
		else 
			return 0;
    });
    for (var i = 0; i < graph.length; i++)
        distanceTo[i] = Number.POSITIVE_INFINITY;
    distanceTo[source] = 0.0;
    parentOf[source] = source;
    pq.put(0.0, source);
    while (!pq.isEmpty()) {
        var v = pq.extractMin().val;
        if (v === dest)
            break;
        var weight = distanceTo[v];
        for (var i = 0; i < graph[v].length; i++) {
            var adj = graph[v][i];
            var old = distanceTo[adj];
            var curr = weight + w(v, adj);
            if (curr < old) {
                parentOf[adj] = v;
                distanceTo[adj] = curr;
                pq.put(curr + h(adj, dest), adj);
            }
        }
    }
    var p = [];
    var temp = dest;
    while (temp !== source) {
        p.push(temp);
        temp = parentOf[temp];
    }
    p.push(source);
    return p;
}