start:
	cd lending-app && poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

start-dashboard:
	cd lendist-dashboard && npm run dev

.PHONY: start start-dashboard 