# -*- coding: utf-8 -*-
import pandas as pd
import json
import os
from flask import Blueprint, jsonify, render_template, session, redirect, url_for, current_app, request

# Define the blueprint:
basic_page = Blueprint('basic_page', __name__)

@basic_page.route('/', methods=['GET'])
def home_page():
    return render_template('index.html')
