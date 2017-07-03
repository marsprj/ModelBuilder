from ModelFlow import settings

from .Graph import Function, Datum
import os.path
import shutil

def dispatch(func):
    result = True
    fname = func.getName()
    if fname == "Stretch":
        result = process_stretch(func)
    elif fname == "Fusion":
        pass

    #return result
    return True

def process_stretch(func):
    inputs = func.getInputs()
    if len(inputs) == 0:
        return False
    output = func.getOutput()
    if output == None:
        return False
    ipath = inputs[0].getPath()
    opath = output.getPath()

    return raster_stretch(ipath, opath)


def raster_stretch(ipath, opath):


    local_ipath = build_local_path(ipath)
    local_opath = build_local_path(opath)

    if not os.path.exists(local_ipath):
        return False

    # if not os.path.exists(local_opath):
    #     return False

    shutil.copy2(local_ipath, local_opath)

    return True

def build_local_path(path):
    root_path = os.path.join(
        os.path.join(
            os.path.join(settings.BASE_DIR, "static"),
            "data"
        ),
        "uploads"
    )

    return os.path.join(
        root_path, path[1:]
    )