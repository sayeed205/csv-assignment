# CSV Assignment API Documentation

Welcome to the CSV Assignment API documentation. This API allows you to import CSV files, check their processing status, and retrieve the processed output. A working demo is available at [https://csv.nekoflix.live](https://csv.nekoflix.live).

### NOTE

For better documentation please visit the dev server or working demo.

## Overview

The API provides the following endpoints:

- **POST /csv/import**: Import a CSV file for processing.
- **GET /csv/{id}/status**: Retrieve the processing status of a CSV file.
- **GET /csv/{id}/output**: Get the processed CSV output.

## Local Setup Guide

To set up the CSV Assignment API locally, follow these steps:

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **Database**: Set up a database (e.g., PostgreSQL and Redis) and configure it in the `.env` file from reference of `.env.example`.

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/sayeed205/csv-assignment
   cd csv-assignment
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Environment Configuration**:

   - Copy the `.env.example` file to `.env` and update the necessary environment variables, especially the database configuration.

4. **Run Migrations**:

   ```bash
   node ace migration:run
   ```

5. **Start the Server**:

   ```bash
   npm run dev
   ```

6. **Access the API**:
   - The API will be available at `http://localhost:{PORT}`.

### Testing

- You can use tools like Postman, curl or visit the api to test the API endpoints locally.

## Endpoints

### POST /csv/import

- **Summary**: Import a CSV file.
- **Description**: This endpoint allows you to upload a CSV file for processing. Optionally, you can provide a webhook URL to be notified upon completion.
- **Request Body**:
  - **file**: (required) The CSV file to be uploaded. Must be in `multipart/form-data` format.
  - **webhookUrl**: (optional) A URL to be notified when processing is complete.
- **Responses**:
  - **201 Created**: CSV imported successfully.
  - **422 Unprocessable Entity**: Validation failed, e.g., invalid CSV format or columns.

### GET /csv/{id}/status

- **Summary**: Retrieve CSV processing status.
- **Description**: Check the current status of a CSV file processing.
- **Path Parameters**:
  - **id**: (required) The UUID of the CSV file.
- **Responses**:
  - **200 OK**: Returns the status and any errors encountered during processing.
  - **404 Not Found**: CSV file not found.

### GET /csv/{id}/output

- **Summary**: Get processed CSV output.
- **Description**: Retrieve the processed CSV file.
- **Path Parameters**:
  - **id**: (required) The UUID of the CSV file.
- **Responses**:
  - **200 OK**: Returns the processed CSV file.
  - **404 Not Found**: CSV file not found.

## Example Usage

### Import CSV

```bash
curl -X POST 'http://localhost:3333/csv/import' \
  -F 'file=@/path/to/your/file.csv' \
  -F 'webhookUrl=https://your-webhook-url.com'
```

### Check Status

```bash
curl -X GET 'http://localhost:3333/csv/{id}/status'
```

### Get Output

```bash
curl -X GET 'http://localhost:3333/csv/{id}/output'
```

## Conclusion

For a live demonstration, visit [https://csv.nekoflix.live](https://csv.nekoflix.live).
