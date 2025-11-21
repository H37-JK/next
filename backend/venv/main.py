from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}

@app.get("/about")
async def read_about():
    return {"page": "About Us", "content": "This is a simple FastAPI example."}