import json

"""
Base Class of Node
"""
class Node:
    _id = ''
    _type = ''

    def __init__(self):
        pass

    def getName(self):
        return self._name

    def setName(self, name):
        self.name = _name

    def getID(self):
        return self._id

    def getType(self):
        return self._type

"""
Datum Node class
"""
class Datum(Node):

    _path = ''
    _from = None
    _to   = None

    def __init__(self, id, path):
        self._id = id
        self._path = path
        self._type = 'data'

        self._from = None
        self._to = None

    def setFromConnection(self, c):
        self._from = c

    def setToConnection(self, c):
        self._to = c

    def getFrom(self):
        if self._from:
            return self._from.getFrom()
        return None

    def getTo(self):
        if self._to:
            return self._to.getTo()
        return None

    def getPath(self):
        return self._path


"""
Function Node Class
"""
class Function(Node):

    # _name = ''
    # _inputs = []
    # _output = None

    def __init__(self, id, name):
        self._id = id
        self._name = name
        self._type = 'function'
        self._inputs = []
        self._output = None

    def getName(self):
        return self._name

    def addInputConnection(self, c):
        self._inputs.append(c)

    def setOutputConnection(self, c):
        self._output = c

    def getOutput(self):
        if self._output:
            return self._output.getTo()

    def getInputs(self):
        inputs = []
        for c in self._inputs:
            frm = c.getFrom()
            if frm:
                inputs.append(frm)
        return inputs


"""
Connection Class
"""
class Connection:

    _from = None
    _to   = None

    def __init__(self, frm, to):
        self._from = frm
        self._to = to
        pass

    def getName(self):
        return self._name

    def setName(self, name):
        self.name = _name

    def getFrom(self):
        return self._from

    def getTo(self):
        return self._to

"""
Graph Class
"""
class Graph:

    _data = []
    _functions = []
    _connections = []

    def __init__(self):
        self._data = []
        self._functions = []
        self._connections = []

    def load(self, text):
        model = json.loads(text)

        functions = model["functions"]
        data = model["data"]
        connections = model["connections"]

        for f in functions:
            fn = self.createFunction(f)
            self._functions.append(fn)

        for d in data:
            dn = self.createDatum(d)
            self._data.append(dn)

        for c in connections:
            cn = self.createConnection(c)
            self._connections.append(cn)

        return True


    def getData(self, id):
        pass

    def getFunction(self, id):
        for f in self._functions:
            if f.getID() == id:
                return f
        return None

    def createFunction(self, f):
        func = Function(f["id"], f["name"])
        return func

    def createDatum(self, d):
        datum = Datum(d["id"], d["path"])
        return datum

    def createConnection(self, c):
        fn = self.findNodeById(c["from"])
        tn = self.findNodeById(c["to"])
        if (not fn) or (not tn):
            return None

        cn = Connection(fn, tn)

        if(fn.getType() == "data"):
            fn.setToConnection(cn)
        elif(fn.getType() == "function"):
            fn.setOutputConnection(cn)

        if (tn.getType() == "data"):
            tn.setFromConnection(cn)
        elif (tn.getType() == "function"):
            tn.addInputConnection(cn)

        return cn

    def findNodeById(self, id):
        for d in self._data:
            if d.getID() == id:
                return d

        for f in self._functions:
            if f.getID() == id:
                return f

        return None

    """
    生成graph的执行计划
    plan返回Function的id序列，该序列为function的执行序列．
    例如：678yv --> idwkp --> 97zf1
    """
    def plan(self):
        flow = []
        tail = self.findLastFunction()

        if tail:
            flow.append(tail)
            self.populateParentFunction(tail, flow)

        return flow

    def findLastFunction(self):
        last = None
        funcs = self._functions;

        if len(funcs)==0:
            return None

        last = funcs[0]
        while(True):
            op = last.getOutput()
            if not op:
                break
            else:
                to = op.getTo()
                if not to:
                    break
                else:
                    last = to

            pass

        return last

    def populateParentFunction(self, func, flow):
        inputs = func.getInputs()
        for d in inputs:
            frm = d.getFrom()
            if frm != None:
                flow.insert(0, frm)
                self.populateParentFunction(frm, flow)
        pass