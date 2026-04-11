from setuptools import setup, find_packages
from cbpi import __version__
import platform

# read the contents of your README file
from os import popen

localsystem = platform.system()
raspberrypi=False
if localsystem == "Linux":
    command="cat /proc/cpuinfo | grep Raspberry"
    model=popen(command).read()
    if len(model) != 0:
        raspberrypi=True


setup(name='cbpi',
      version=__version__,
      description='CraftBeerPi',
      author='Manuel Fritsch',
      author_email='manuel@craftbeerpi.com',
      url='http://web.craftbeerpi.com',
      packages=find_packages(),
      include_package_data=True,
      package_data={
        # If any package contains *.txt or *.rst files, include them:
      '': ['*.txt', '*.rst', '*.yaml'],
      'cbpi': ['*','*.txt', '*.rst', '*.yaml']},

      python_requires='>=3.9',

      install_requires=[
          "aiohttp>=3.9",
          "aiohttp-auth==0.1.1",
          "aiohttp-route-decorator==0.1.4",
          "aiohttp-security==0.5.0",
          "aiohttp-session>=2.11.0",
          "aiohttp-swagger==1.0.16",
          "aiojobs==1.3.0",
          "aiosqlite==0.20.0",
          "cryptography==43.0.3",
          "requests==2.31.0",
          "voluptuous==0.15.2",
          "pyfiglet==1.0.2",
          'click==8.1.8',
          'shortuuid==1.0.13',
          'tabulate==0.9.0',
          'aiomqtt>=2.0.0',
          'questionary>=2.0.0',
          'colorama==0.4.6',
          'psutil==5.9.8',
          'cbpi4ui',
          'importlib_metadata',
          'numpy==1.24.4',
          'pandas==2.0.3'] + (
          ['RPi.GPIO==0.7.1'] if raspberrypi else [] ),

        dependency_links=[
        'https://testpypi.python.org/pypi',
        
        ],
      entry_points = {
        "console_scripts": [
            "cbpi=cbpi.cli:main",
        ]
    }
)
