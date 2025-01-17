import { supabase } from "@/integrations/supabase/client";
import { School } from "@/types/admin";

export const createSchool = async (name: string) => {
  const { data, error } = await supabase
    .from('schools')
    .insert({ name })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createClass = async (name: string, schoolId: string) => {
  const { data, error } = await supabase
    .from('classes')
    .insert({ name, school_id: schoolId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createStudent = async (name: string, classId: string, accessCode: string) => {
  const { data, error } = await supabase
    .from('students')
    .insert({ name, class_id: classId, access_code: accessCode })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchSchools = async (): Promise<School[]> => {
  // First, fetch schools with their classes and students
  const { data: schoolsData, error: schoolsError } = await supabase
    .from('schools')
    .select(`
      *,
      classes:classes (
        *,
        students:students (*)
      )
    `);
  
  if (schoolsError) throw schoolsError;

  // Then, fetch all photos
  const { data: photosData, error: photosError } = await supabase
    .from('photos')
    .select('*');

  if (photosError) throw photosError;

  // Create a map of student IDs to their photos
  const studentPhotos = new Map();
  photosData?.forEach(photo => {
    if (!studentPhotos.has(photo.student_id)) {
      studentPhotos.set(photo.student_id, []);
    }
    // Convert Supabase URL to S3 URL if needed
    let photoUrl = photo.url;
    if (photoUrl.includes('supabase')) {
      const filename = photoUrl.split('/').pop();
      photoUrl = `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/photos/${filename}`;
    }
    studentPhotos.get(photo.student_id).push(photoUrl);
  });

  // Transform the data to match our types
  return schoolsData.map((school): School => ({
    id: school.id,
    name: school.name,
    created_at: school.created_at,
    classes: school.classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      school_id: cls.school_id,
      created_at: cls.created_at,
      students: cls.students.map(student => ({
        id: student.id,
        name: student.name,
        access_code: student.access_code,
        class_id: student.class_id,
        created_at: student.created_at,
        photoUrl: studentPhotos.get(student.id)?.[0] // Get the first photo URL if it exists
      }))
    }))
  }));
};