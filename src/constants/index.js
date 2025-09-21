export const STATUSCOLORS = { Draft: 'default', Published: 'primary', Completed: 'success' }

export const TABS = {
    NEW: "new",
    SUBMITTED: "submitted",
    EXPIRED: "expired"
} 

export const BASE_FIELDS = [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
]

export const REGISTRATION_FIELDS = [
    { name: 'name', label: 'Name', required: true },
    ...BASE_FIELDS
];


export const LOGIN_FIELDS = BASE_FIELDS

export const TEACHER_REGISTRATION_FIELDS = [
    { name: 'name', label: 'Teacher Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Temporary Password', type: 'password', required: true },
]

export const ROLES = {
    TEACHER: "teacher",
    STUDENT: "student",
    ADMIN: "admin"
}


export const ASSIGNMENT_FIELDS = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: true,
      multiline: true,
      rows: 4,
    },
    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Draft', 'Published', 'Completed'],
      required: true,
    },
  ];