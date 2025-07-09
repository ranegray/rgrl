import pybullet as p, time, pybullet_data

p.connect(p.DIRECT)
p.setAdditionalSearchPath(pybullet_data.getDataPath())
p.loadURDF("plane.urdf")
robot = p.loadURDF("r2d2.urdf", [0, 0, 1])
for _ in range(6000):          # ~120 s @ 50 Hz
    p.stepSimulation()
    time.sleep(1/50)
