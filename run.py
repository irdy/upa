from use_push_app import create_app

# for locale usage?
# web: gunicorn module_name_where_app_instance_exists:name_of_the_app_instance
# web: run:app

print("run")
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', debug=True)

