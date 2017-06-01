"""This module parses yaml files"""
import yaml


def get_yaml_info(filepath, env_level):
    """ This function get config info depending on the environment level. """
    stream = open(filepath, 'r')
    config = yaml.load(stream)
    return config.get(env_level)
