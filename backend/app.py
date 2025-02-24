from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/save_classes', methods=['POST'])
def save_classes():
    pass

@app.route('/delete_classes')
def delete_classes():
    pass

@app.route('/get_classes', methods=['POST'])
def get_classes():
    pass

if __name__ == '__main__':
    app.run(debug=True)