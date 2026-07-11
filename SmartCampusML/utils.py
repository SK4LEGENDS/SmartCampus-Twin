import os
import logging

def setup_logging():
    """Sets up pipeline-wide logging to console and file."""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pipeline.log")
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler()
        ]
    )
    
    # Suppress verbose matplotlib and PIL logs
    logging.getLogger("matplotlib").setLevel(logging.WARNING)
    logging.getLogger("PIL").setLevel(logging.WARNING)
    
    return logging.getLogger("SmartCampusML")

def init_directories():
    """Ensures all necessary directories exist in the project."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dirs = [
        os.path.join(base_dir, "data", "raw"),
        os.path.join(base_dir, "data", "processed"),
        os.path.join(base_dir, "models"),
        os.path.join(base_dir, "outputs", "plots"),
        os.path.join(base_dir, "outputs", "reports"),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def print_banner(title):
    """Prints a formatted text banner for logging output clarity."""
    logger = logging.getLogger("SmartCampusML")
    border = "=" * 60
    logger.info(border)
    logger.info(f" {title.upper()} ".center(60, "="))
    logger.info(border)
