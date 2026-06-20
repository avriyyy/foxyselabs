from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FOX_", case_sensitive=False, extra="ignore")

    agent_port: int = 8000
    log_level: str = "info"

    # Workspace + sandbox
    workspace_root: str = "/data/workspaces"
    sandbox_image: str = "ubuntu:24.04"

    # Claude Code adapter
    # Default to the container path; auto-detect local user install if absent.
    claude_code_path: str = "/usr/local/bin/claude"
    claude_settings_file: str = "/etc/claude/settings.json"
    claude_model: str = "mimo-v2-flash"
    claude_effort: str = "medium"

    # Timeouts
    claude_timeout_sec: int = 1800  # 30 min max per turn


settings = Settings()

# Auto-detect: if the default path doesn't exist, try the user's local
# install so the agent works for local dev without rebuilding the image.
import os as _os

if not _os.path.exists(settings.claude_code_path):
    for alt in (
        _os.path.expanduser("~/.local/bin/claude"),
        _os.path.expanduser("~/bin/claude"),
        "/usr/bin/claude",
    ):
        if _os.path.exists(alt):
            settings.claude_code_path = alt
            break

# Same for the settings file — fall back to a host path for local dev.
if not _os.path.exists(settings.claude_settings_file):
    for alt in (
        _os.path.expanduser("~/.claude/settings.json"),
        _os.path.expanduser("~/claude-settings.json"),
    ):
        if _os.path.exists(alt):
            settings.claude_settings_file = alt
            break
