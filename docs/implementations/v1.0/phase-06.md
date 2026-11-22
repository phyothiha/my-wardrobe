# Phase 06 - v1.0

## Goals

- [x] CRUD brand
- [x] CRUD category
- [x] CRUD cloth
- [x] Only build backend api. Do not connect with frontend.

## Ref docs

- [README](../../../README.md)
- [Release - v1.0](../../releases/v1.0.md).
- [Phase 01 - v1.0](./phase-01.md)
- [Phase 02 - v1.0](./phase-02.md)
- [Phase 03 - v1.0](./phase-03.md)
- [Phase 04 - v1.0](./phase-04.md)
- [Phase 05 - v1.0](./phase-05.md)

## Technical Requirements

### API

#### Tech Stack

- Core framework: [Laravel](https://laravel.com/framework/docs)
- Framework version: 13.x (latest)
- Database Driver: MySQL (Localhost)
  - Username: root
  - password: password
  - Database: wardrobe

#### Get Started

- Create [Application](https://laravel.com/framework/docs#creating-an-application)
- Install [API Routes](https://laravel.com/framework/docs/routing#api-routes)
- Use [Laravel Boost](https://laravel.com/framework/docs/boost)
- [Customizing Dev Processes](https://laravel.com/framework/docs/artisan#customizing-dev-processes)
  - only 'server'

### Constraints

#### MUST

- API versioning. `/api/v1`
- [Form Request Validation](https://laravel.com/framework/docs/validation#form-request-validation)
- [Eloquent: API Resources](https://laravel.com/framework/docs/eloquent-resources)
- Use [API Resource Routes](https://laravel.com/framework/docs/controllers#api-resource-routes)
- Controller just accept, validate, return the response.
- Service class will handle business logic.
- Make pagination records to 10.
- Cloth pagination lists are order by latest created at timestamp.
- Brand and Category lists are order by name ascending.

### Image

- Use Polymorphic image class. So we can later use across models.
- Cloth hasMany Images. (Current implementation)
- Brand hasOne Images. (This is future, just show as an example.)
- Category hasOne Images. (This is future, just show as an example.)

### Category

- Unique category name.
- Varchar with 255 length.
- Fallback category name called "Uncategorized".
  - Prevent deletion from application validation request level.
- Category without child rows able to delete.
- Category with child rows deletion will be assigned to "Uncategorized".
- Create a "Uncategorized" record using factory in DatabaseSeeder class.
  - Seeding will only run once.
  - Can't Update or Delete this value.

### Brand

- Unique Brand name.
- Varchar with 255 length.
- Fallback Brand name called "Unknown".
  - Prevent deletion from application validation request level.
- Brand without child rows able to delete.
- Brand with child rows deletion will be assigned to "Unknown".
- Create a "Unknown" record using factory in DatabaseSeeder class.
  - Seeding will only run once.
  - Can't Update or Delete this value.

### Cloth

- Store uploaded images in laravel storage folder.
  - Use [Public Disk](https://laravel.com/framework/docs/13.x/filesystem#the-public-disk)
- Each cloth must have 1–5 photos after creation or update. Editing other fields keeps the existing photos.
  - Only accept jpg, jpeg, png for now.
  - Don't care about uploaded file size limitation.

### Response structure

You should replace "Record" with dedicated model name in message.

#### 200 ok

- Can use with single resource such as show.

```
{
  message: "Meaningful message",
  status: 200,
  data: {}
}
```

##### Create 201

```
{
  message: "Record is created successfully.",
  status: 201,
  data: {}
}
```

##### Update 200

```
{
  message: "Record is updated successfully.",
  status: 200,
  data: {}
}
```

##### Delete 200

```
{
  message: "Record is deleted successfully.",
  status: 200
}
```

#### 200 ok

- Can use with pagination result set such as index.

```
{
  message: "Meaningful message",
  status: 200,
  data: []
  // laravel pagination meta data
}
```

#### 422

- Use laravel default structure.

#### Other error code

```
{
  message: "Meaningful message",
  status: HTTP_ERR_CODE
}
```

## Footer Notes

- Used model: GPT-6.2 Astra Light
