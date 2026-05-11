# pyrefly: ignore [missing-import]
from google.adk.agents import SequentialAgent
# pyrefly: ignore [missing-import]
from google.adk.apps import App

from .labelsense import create_labelsense_agent
from .safetyguard import create_safetyguard_agent
from .voiceassistant import create_voiceassist_agent

labelsense_agent = create_labelsense_agent()
safetyguard_agent = create_safetyguard_agent()
voiceassist_agent = create_voiceassist_agent()

root_agent = SequentialAgent(
    name="EchoRxRootAgent",
    sub_agents=[labelsense_agent, safetyguard_agent, voiceassist_agent]
)

app_adk = App(
    name="echorx_app",
    root_agent=root_agent
)
