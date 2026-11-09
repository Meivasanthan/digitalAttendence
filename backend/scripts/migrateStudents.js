const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('../models/student'); 

const studentsData = [
  { name: "AAYASHIA MAHIRA.K", regNo: "23CS001", email: "23CS001@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "AKASH.K", regNo: "23CS002", email: "23CS002@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "ANITHA.AR", regNo: "23CS003", email: "23CS003@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "ATHULYA.G", regNo: "23CS004", email: "23CS004@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "BALAHARIHARAN.S", regNo: "23CS005", email: "23CS005@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "BHARATHIPRIYA.V", regNo: "23CS006", email: "23CS006@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "BHARATHKUMAR.J.A", regNo: "23CS007", email: "23CS007@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DEEPIKA.G", regNo: "23CS009", email: "23CS009@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "DEEPIKA.S", regNo: "23CS010", email: "23CS010@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DEVENDAR.A", regNo: "23CS011", email: "23CS011@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DHANUSRI.K", regNo: "23CS012", email: "23CS012@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "DHARANI.S", regNo: "23CS013", email: "23CS013@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DHARSHINI.K", regNo: "23CS014", email: "23CS014@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "DHINESH.K", regNo: "23CS015", email: "23CS015@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "ELANGOVAN.S", regNo: "23CS016", email: "23CS016@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "ELAVARASAN.M", regNo: "23CS017", email: "23CS017@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "FATHIMA MAHIRA.M", regNo: "23CS018", email: "23CS018@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "GOKUL.L", regNo: "23CS019", email: "23CS019@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "HARINIVYA.M", regNo: "23CS020", email: "23CS020@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "HEMA.A.C", regNo: "23CS021", email: "23CS021@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "JASWANTH.V", regNo: "23CS022", email: "23CS022@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "JAYESH.R", regNo: "23CS023", email: "23CS023@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "JEKAN.N", regNo: "23CS024", email: "23CS024@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "KARTHIK.C", regNo: "23CS025", email: "23CS025@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "KAVIKUMAR.M", regNo: "23CS026", email: "23CS026@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KAVINESWARAN.P", regNo: "23CS027", email: "23CS027@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KAVINKUMAR.S", regNo: "23CS028", email: "23CS028@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KAVIYA.S", regNo: "23CS029", email: "23CS029@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KIRUTHIKA V", regNo: "23CS030", email: "23CS030@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "KISHORE ABINASH.A", regNo: "23CS031", email: "23CS031@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KISHOREKUMAR.A", regNo: "23CS032", email: "23CS032@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "LOKITH KUMAR.S", regNo: "23CS033", email: "23CS033@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "MANIBHARATHI.A", regNo: "23CS034", email: "23CS034@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "MOHID.S", regNo: "23CS035", email: "23CS035@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "MONIKA.R", regNo: "23CS036", email: "23CS036@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "NANDHINI.K", regNo: "23CS037", email: "23CS037@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "NITHYA.V", regNo: "23CS038", email: "23CS038@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "PHURNES.M.S", regNo: "23CS039", email: "23CS039@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "PRABANJAN.J", regNo: "23CS040", email: "23CS040@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "PREETHLK", regNo: "23CS041", email: "23CS041@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RAJA.S", regNo: "23CS042", email: "23CS042@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RAMESH.S", regNo: "23CS043", email: "23CS043@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "RASWANDH.S.S", regNo: "23CS044", email: "23CS044@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RIDUVARSHINI.L.M", regNo: "23CS045", email: "23CS045@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RUU.S", regNo: "23CS046", email: "23CS046@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RITHANYA.P", regNo: "23CS047", email: "23CS047@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RITHIKA.S", regNo: "23CS048", email: "23CS048@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "SANJAY GOPAL J", regNo: "23CS049", email: "23CS049@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SATHANA.N", regNo: "23CS050", email: "23CS050@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SATHISH.S", regNo: "23CS051", email: "23CS051@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SAVITHA.U", regNo: "23CS052", email: "23CS052@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SHALINILK", regNo: "23CS053", email: "23CS053@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SOWMIYA.M", regNo: "23CS054", email: "23CS054@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SUBARANJANILS", regNo: "23CS055", email: "23CS055@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SUPRIYA.M", regNo: "23CS056", email: "23CS056@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SUSMITHA.S", regNo: "23CS057", email: "23CS057@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "TAMIL ALAGAN.L", regNo: "23CS058", email: "23CS058@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "TAMIL SELVAN K", regNo: "23CS059", email: "23CS059@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "THAARANYAASREE.S", regNo: "23CS060", email: "23CS060@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "VASAVI N", regNo: "23CS061", email: "23CS061@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VIKASINIR", regNo: "23CS062", email: "23CS062@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VIKNEASH.M", regNo: "23CS063", email: "23CS063@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "VIMAL.P", regNo: "23CS064", email: "23CS064@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "VINOTHLE", regNo: "23CS065", email: "23CS065@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VISHNU SELVAN.M", regNo: "23CS066", email: "23CS066@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "AAKASH S P", regNo: "23CS067", email: "23CS067@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "ABHINANDAN S", regNo: "23CS068", email: "23CS068@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "ABINAYA R", regNo: "23CS069", email: "23CS069@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "ABISHEK RV", regNo: "23CS070", email: "23CS070@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "AKILAN M K", regNo: "23CS071", email: "23CS071@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "ARIPRASAΤΗ Μ", regNo: "23CS073", email: "23CS073@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "ARUNESH SS", regNo: "23CS074", email: "23CS074@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "ASHWANTH A", regNo: "23CS075", email: "23CS075@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "ASHWIN S", regNo: "23CS076", email: "23CS076@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "BALASANJEEV C", regNo: "23CS077", email: "23CS077@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "BARATH VR", regNo: "23CS078", email: "23CS078@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "CHANDRU V", regNo: "23CS079", email: "23CS079@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DEEPAK R", regNo: "23CS080", email: "23CS080@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "DHARINEESH S", regNo: "23CS081", email: "23CS081@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DHIVYA S", regNo: "23CS082", email: "23CS082@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DINESH J", regNo: "23CS083", email: "23CS083@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "GOBINATH M", regNo: "23CS084", email: "23CS084@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "GOMALA P", regNo: "23CS085", email: "23CS085@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "HARIHARAN S", regNo: "23CS086", email: "23CS086@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "HARSHAVARTHINI K", regNo: "23CS087", email: "23CS087@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "HEMALATHA S", regNo: "23CS088", email: "23CS088@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "KAVYA SHREE A", regNo: "23CS090", email: "23CS090@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KISHORE KUMAR J", regNo: "23CS091", email: "23CS091@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "KISHORE T", regNo: "23CS092", email: "23CS092@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "LAKSHMINARAYANAN S", regNo: "23CS093", email: "23CS093@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "MALATHI R", regNo: "23CS094", email: "23CS094@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "MEIAKASH B", regNo: "23CS095", email: "23CS095@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "MOHAMED NAEEM S", regNo: "23CS096", email: "23CS096@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "MOHITH V", regNo: "23CS097", email: "23CS097@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "NAKSHATRA C", regNo: "23CS098", email: "23CS098@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "NAKSHATRA PRIYAL R", regNo: "23CS099", email: "23CS099@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "NANDHANA AK", regNo: "23CS100", email: "23CS100@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "NETHAJI M", regNo: "23CS101", email: "23CS101@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "NISHANTH RAJ M", regNo: "23CS102", email: "23CS102@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "NITHYASHREE RS", regNo: "23CS103", email: "23CS103@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "PERARASU M", regNo: "23CS104", email: "23CS104@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "POOJA SHREE R", regNo: "23CS105", email: "23CS105@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "POOJASURUTHIKA T", regNo: "23CS106", email: "23CS106@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "PRAVEEN M", regNo: "23CS107", email: "23CS107@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RAGAVI M", regNo: "23CS108", email: "23CS108@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "RAVIVARMAN S", regNo: "23CS109", email: "23CS109@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "SHANMUGAVEL R", regNo: "23CS110", email: "23CS110@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SHASTHIKA S P", regNo: "23CS111", email: "23CS111@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SHREESABARI S", regNo: "23CS112", email: "23CS112@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SIBINISHWANTH S", regNo: "23CS113", email: "23CS113@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SIVABALASUBRAMANIAN S", regNo: "23CS114", email: "23CS114@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SONIA M", regNo: "23CS115", email: "23CS115@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SOORYA S", regNo: "23CS116", email: "23CS116@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SRIDHAR BM", regNo: "23CS117", email: "23CS117@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SRINNETHI R.D.", regNo: "23CS118", email: "23CS118@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SUBARANJANI N", regNo: "23CS119", email: "23CS119@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SUMAYA A", regNo: "23CS120", email: "23CS120@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "THARANEESH MR", regNo: "23CS121", email: "23CS121@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "THARUN A", regNo: "23CS122", email: "23CS122@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "UMMU KULSU A", regNo: "23CS123", email: "23CS123@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VARSHA K", regNo: "23CS124", email: "23CS124@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VARSHINI S", regNo: "23CS125", email: "23CS125@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VARUN S", regNo: "23CS126", email: "23CS126@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VIJAY SURYA C", regNo: "23CS128", email: "23CS128@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "VIJAYALAKSHMI V", regNo: "23CS129", email: "23CS129@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VISHAL C", regNo: "23CS130", email: "23CS130@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "VISWAACSENAR J", regNo: "23CS131", email: "23CS131@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "YOGIRAM S", regNo: "23CS132", email: "23CS132@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "AKSHAYA D", regNo: "23CS133", email: "23CS133@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "ARAVIND L", regNo: "23CS134", email: "23CS134@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "BHARANEETHARAN PT", regNo: "23CS136", email: "23CS136@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "BHARATHGA", regNo: "23CS137", email: "23CS137@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DEVVISHAL VA", regNo: "23CS138", email: "23CS138@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "DHARASRIR", regNo: "23CS139", email: "23CS139@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "DHARINEESH PA", regNo: "23CS140", email: "23CS140@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "DHASHIN SS", regNo: "23CS141", email: "23CS141@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "GOWTHAM S", regNo: "23CS142", email: "23CS142@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "JOTHIPRAKASH P", regNo: "23CS144", email: "23CS144@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "KARTHIK S", regNo: "23CS145", email: "23CS145@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "KELWIN DANI ISRAEL", regNo: "23CS146", email: "23CS146@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "KESAVAN K", regNo: "23CS147", email: "23CS147@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KIRUTHIKHA S", regNo: "23CS148", email: "23CS148@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "KRISHNASAMY S", regNo: "23CS149", email: "23CS149@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "MOHAMED ABUBAKKAR SIDDIQ A", regNo: "23CS150", email: "23CS150@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "MOHAMMED MANASHIK Z", regNo: "23CS151", email: "23CS151@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "MUGILAN VS", regNo: "23CS152", email: "23CS152@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "MUKUNTAN RS", regNo: "23CS153", email: "23CS153@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "NANDHA ABISHEK P", regNo: "23CS154", email: "23CS154@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "NAVEEN KRISHNAN M", regNo: "23CS155", email: "23CS155@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "PRABANJAN S", regNo: "23CS156", email: "23CS156@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "PRABHANJAN R", regNo: "23CS157", email: "23CS157@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "RAGHUKE", regNo: "23CS158", email: "23CS158@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "RAMANITHARAN S", regNo: "23CS159", email: "23CS159@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "SAKTHI SABARIESWAR M S", regNo: "23CS162", email: "23CS162@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "SANTHOSH DINAKARAN", regNo: "23CS163", email: "23CS163@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SASIKUMAR D", regNo: "23CS164", email: "23CS164@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SASTHIKA SY", regNo: "23CS165", email: "23CS165@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SHALINI M", regNo: "23CS166", email: "23CS166@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SHALINI N", regNo: "23CS167", email: "23CS167@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SHRI KAVIYA VARSHINI R", regNo: "23CS168", email: "23CS168@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SOWBARNIKA R", regNo: "23CS169", email: "23CS169@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SREERAMKUMAR K", regNo: "23CS170", email: "23CS170@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SRINITHI R", regNo: "23CS171", email: "23CS171@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SUDHEKSHA S", regNo: "23CS172", email: "23CS172@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "SUJITHKRISHNA A", regNo: "23CS173", email: "23CS173@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "SUPRATHA BНООРАТНІ В", regNo: "23CS174", email: "23CS174@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "THARSSAN SRIRAM CJ", regNo: "23CS175", email: "23CS175@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "THIPAL K", regNo: "23CS176", email: "23CS176@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "THIRUMURUGAN M", regNo: "23CS177", email: "23CS177@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VARATHARAJAN S", regNo: "23CS178", email: "23CS178@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VELUSAMY B", regNo: "23CS179", email: "23CS179@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "VIKASH M", regNo: "23CS180", email: "23CS180@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "CHANDRU P", regNo: "23CSL01", email: "23CSL01@nandhaengg.org", section: "A", proctorId: "S002" },
  { name: "DHARSHINI R", regNo: "23CSL02", email: "23CSL02@nandhaengg.org", section: "A", proctorId: "S001" },
  { name: "HARISIVAA VL", regNo: "23CSL05", email: "23CSL05@nandhaengg.org", section: "B", proctorId: "S003" },
  { name: "JAGANT", regNo: "23CSL06", email: "23CSL06@nandhaengg.org", section: "B", proctorId: "S004" },
  { name: "KISHOWER RS", regNo: "23CSL07", email: "23CSL07@nandhaengg.org", section: "C", proctorId: "S006" },
  { name: "LOGESH", regNo: "23CSL08", email: "23CSL08@nandhaengg.org", section: "C", proctorId: "S005" },
  { name: "MEIVASANTHAN V", regNo: "23CSL09", email: "23CSL09@nandhaengg.org", section: "C", proctorId: "S006" }
];

const migrateStudents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-attendance');
    console.log('Connected to MongoDB');

    // Clear existing students (optional - remove if you don't want to clear)
    await Student.deleteMany({});
    console.log('Cleared existing students');

    // Add studentId and password to each student
    const studentsWithIds = studentsData.map((student, index) => ({
      ...student,
      studentId: index + 1, // Simple numeric ID starting from 1
      password: student.regNo, // Password = regNo (not encrypted)
      department: "CSE",
      year: "III",
      photo: `/assets/${student.regNo.toLowerCase()}.jpg`
    }));

    // Insert students into database
    const result = await Student.insertMany(studentsWithIds);
    console.log(`Successfully migrated ${result.length} students to the database`);

    // Display sample of created students
    console.log('\nSample of created students:');
    result.slice(0, 5).forEach(student => {
      console.log(`ID: ${student.studentId}, Name: ${student.name}, RegNo: ${student.regNo}, Password: ${student.password}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateStudents();