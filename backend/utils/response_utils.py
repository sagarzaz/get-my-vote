from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    response = {
        'success': True,
        'message': message
    }
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code

def error_response(message="Error", status_code=400, error_code=None):
    response = {
        'success': False,
        'message': message
    }
    if error_code:
        response['error_code'] = error_code
    return jsonify(response), status_code

def validation_response(errors):
    return error_response(
        message="Validation failed",
        status_code=422,
        error_code=errors
    )
