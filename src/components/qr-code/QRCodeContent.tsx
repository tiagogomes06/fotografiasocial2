import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import QRCodeImage from "./QRCodeImage";
import QRCodeLogo from "./QRCodeLogo";
import QRCodeStudentInfo from "./QRCodeStudentInfo";
import QRCodeStudentPhoto from "./QRCodeStudentPhoto";

interface QRCodeContentProps {
  studentId: string;
  studentName: string;
  accessCode: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

const QRCodeContent = ({ studentId, studentName, accessCode, containerRef }: QRCodeContentProps) => {
  const [schoolInfo, setSchoolInfo] = useState<{ schoolName: string; className: string }>();
  const [randomPhoto, setRandomPhoto] = useState<string>();
  const qrValue = `https://fotografiasocial.duploefeito.com/access?code=${accessCode}`;

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          class_id,
          classes:classes (
            name,
            schools:schools (
              name
            )
          ),
          photos (url)
        `)
        .eq('id', studentId)
        .single();

      if (error) {
        console.error('Error fetching student info:', error);
        return;
      }

      if (data) {
        setSchoolInfo({
          schoolName: data.classes.schools.name,
          className: data.classes.name
        });

        if (data.photos && data.photos.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.photos.length);
          const photoUrl = data.photos[randomIndex].url;
          const { data: publicUrl } = supabase.storage
            .from('photos')
            .getPublicUrl(photoUrl.split('/').pop() || '');
          setRandomPhoto(publicUrl.publicUrl);
        }
      }
    };

    fetchStudentInfo();
  }, [studentId]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center p-6 space-y-4 bg-white"
      style={{ minWidth: '400px' }}
    >
      <QRCodeLogo />

      {schoolInfo && (
        <QRCodeStudentInfo
          schoolName={schoolInfo.schoolName}
          className={schoolInfo.className}
          studentName={studentName}
        />
      )}

      {randomPhoto && (
        <QRCodeStudentPhoto
          photoUrl={randomPhoto}
          studentName={studentName}
        />
      )}

      <QRCodeImage 
        qrValue={qrValue}
        containerRef={containerRef}
        studentName={studentName}
      />

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Código de Acesso: {accessCode}</p>
        <p className="text-sm text-muted-foreground">Site para acesso: fotografiasocial.duploefeito.com</p>
      </div>
    </div>
  );
};

export default QRCodeContent;