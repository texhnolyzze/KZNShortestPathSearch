package sandbox;

import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;

/**
 *
 * @author Texhnolyze
 */
public class Sandbox {
    
    public static void main(String[] args) throws IOException {
        
        Scanner sc = new Scanner(new FileInputStream("Roads.txt"));
		sc.nextLine(); // skip comment
        int pointID = 0;
        Map<Vec2, Integer> pointToPointID = new HashMap<>();
        List<PolyLine> polyLines = new ArrayList<>();
        PolyLine currPolyLine = null;
        while (sc.hasNextLine()) {
            String str = sc.nextLine();
            if (str.contains("ENDPOLY")) 
                polyLines.add(currPolyLine);
            else if (str.contains("BEGPOLY")) 
                currPolyLine = new PolyLine();
            else {
                String[] s = str.split("\\s");
                Vec2 v = new Vec2(Double.parseDouble(s[0]), 2360 - Double.parseDouble(s[1]));
                if (!pointToPointID.containsKey(v))
                    pointToPointID.put(v, pointID++);
                currPolyLine.pointIndices.add(pointToPointID.get(v));
            }
        }
        SortedMap<Integer, Vec2> pointIDToPoint = new TreeMap<>();
        for (Map.Entry<Vec2, Integer> entry : pointToPointID.entrySet()) 
            pointIDToPoint.put(entry.getValue(), entry.getKey());
        PrintWriter pw = new PrintWriter(new FileWriter("vertices.json"));
        pw.append("vertices = [\n");
        for (Map.Entry<Integer, Vec2> entry : pointIDToPoint.entrySet()) 
            pw.append("\t{x: ").append(entry.getValue().x + "").append(", y: ").append(entry.getValue().y + "},\n");
        pw.append("]");
        pw.flush();
        Map<Integer, Set<Integer>> graph = new HashMap<>();
        for (int vertex = 0; vertex < pointIDToPoint.size(); vertex++) {
            Set<Integer> adj = new HashSet<>();
            graph.put(vertex, adj);
            for (PolyLine pl : polyLines) {
                for (int i = 0; i < pl.pointIndices.size(); i++) {
                    int v = pl.pointIndices.get(i);
                    if (vertex == v) {
                        if (i != 0)
                            adj.add(pl.pointIndices.get(i - 1));
                        if (i != pl.pointIndices.size() - 1)
                            adj.add(pl.pointIndices.get(i + 1));
                    }
                }
            }
        }
        pw = new PrintWriter(new FileWriter("graph.json"));
        pw.append("graph = [\n");
        for (Map.Entry<Integer, Set<Integer>> entry : graph.entrySet()) {
            pw.append("\t[");
            Iterator<Integer> it = entry.getValue().iterator();
            for (int i = 0; i < entry.getValue().size() - 1; i++) 
                pw.append(it.next() + "").append(", ");
            if (it.hasNext())
                pw.append(it.next() + "");
            pw.append("],\n");
        }
        pw.append("]");
        pw.flush();
    }
    
    static class Vec2 {
        
        double x, y;
        
        Vec2(double x, double y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public int hashCode() {
            int hash = 7;
            hash = 59 * hash + (int) (Double.doubleToLongBits(this.x) ^ (Double.doubleToLongBits(this.x) >>> 32));
            hash = 59 * hash + (int) (Double.doubleToLongBits(this.y) ^ (Double.doubleToLongBits(this.y) >>> 32));
            return hash;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) 
                return true;
            if (obj == null) 
                return false;
            if (getClass() != obj.getClass()) 
                return false;
            final Vec2 other = (Vec2) obj;
            if (Double.doubleToLongBits(this.x) != Double.doubleToLongBits(other.x)) 
                return false;
            return Double.doubleToLongBits(this.y) == Double.doubleToLongBits(other.y);
        }
        
    }
    
    static class PolyLine {
        List<Integer> pointIndices = new ArrayList<>();
    }
    
}