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

## Webhook Integration

The CSV Assignment API supports webhook integration to notify external services when a CSV file has been processed. This feature is useful for automating workflows and integrating with other systems.

### How It Works

- When you import a CSV file using the **POST /csv/import** endpoint, you can optionally provide a `webhookUrl` in the request body.
- Once the CSV processing is complete, the API will send a POST request to the specified `webhookUrl`.
- The webhook payload includes the status of the CSV processing, the time it was processed, and any errors encountered.

### Webhook Payload

The POST request to the webhook URL will include the following JSON payload:

```json
{
  "status": "completed",
  "processedAt": "2023-10-01T12:00:00Z",
  "error": null
}
```

- **status**: The current status of the CSV processing (e.g.,"pending", "processing", "completed", "error").
- **processedAt**: The timestamp when the CSV processing was completed.
- **error**: Any error message encountered during processing, or `null` if there were no errors.

### Configuring the Webhook

To configure a webhook:

1. When importing a CSV file, include the `webhookUrl` parameter in your request:

   ```bash
   curl -X POST 'http://localhost:3333/csv/import' \
     -F 'file=@/path/to/your/file.csv' \
     -F 'webhookUrl=https://your-webhook-url.com'
   ```

2. Ensure that the specified `webhookUrl` is accessible and can handle POST requests with JSON payloads.

### Error Handling

- If the webhook invocation fails, the error will be logged, but it will not affect the processing of the CSV file.
- Ensure your webhook endpoint is reliable and can handle potential retries or failures.

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
