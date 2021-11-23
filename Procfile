web: gunicorn use_push_app:app
web: sh -c 'cd ./use-push-app/client/use-push-app && npm run build'
release: alembic upgrade head
