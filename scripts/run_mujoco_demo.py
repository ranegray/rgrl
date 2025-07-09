import mujoco, time

model = mujoco.MjModel.from_xml_string(
    "<mujoco><worldbody><body><geom type='sphere' size='0.1'/></body></worldbody></mujoco>"
)
data = mujoco.MjData(model)
for _ in range(6000):          # ~120 s
    mujoco.mj_step(model, data)
    time.sleep(1/50)
