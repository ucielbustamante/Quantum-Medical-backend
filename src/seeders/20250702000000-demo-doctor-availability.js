'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) IDs de doctores (13 UUIDs)
    const doctorIds = [
      "04c3c24a-ab08-4632-a2a7-a232ecfa040c",
      "c70f1747-2735-4401-9895-78585ebdda7b",
      "c381ab7d-df38-4e15-83e4-758e1f0d9117",
      "e7185944-b0a5-4cf5-89d2-b155c5fb2367",
      "7537cefc-d35e-41db-8b08-954030fc3a30",
      "28d99f2d-9380-46a1-b7c7-e9f8bf5ed862",
      "a32d91f4-fcc2-40af-aafc-74ab07427626",
      "72fb6dce-efe0-4b01-9c00-07002567dac1",
      "19ce50c8-4bad-4aa1-87a7-bd1f1707b10a",
      "808e254c-46db-4efe-bc6d-6a5244a7fe84",
      "2967986b-5556-40e5-8701-ddbceed0a1a2",
      "fd01fbb6-8e5d-45e3-a01c-5effc345a573",
      "c1d00644-2865-4ef0-b558-52008b20a1e3"
    ];

    // 2) Agrupación por especialidad
    const dermatologyDoctors = [
      "c70f1747-2735-4401-9895-78585ebdda7b",
      "7537cefc-d35e-41db-8b08-954030fc3a30",
      "808e254c-46db-4efe-bc6d-6a5244a7fe84"
    ];
    const cardiologyDoctors = [
      "04c3c24a-ab08-4632-a2a7-a232ecfa040c",
      "c381ab7d-df38-4e15-83e4-758e1f0d9117",
      "19ce50c8-4bad-4aa1-87a7-bd1f1707b10a",
      "fd01fbb6-8e5d-45e3-a01c-5effc345a573"
    ];

    //143 UUIDs fijos. Abarca toda la semana, de lunes a viernes de 12 a 14 y 15 a 18
    // tambien sabado de 12 a 15hs
    const fixedIds = [
      "1ccb18d6-bd74-4942-aa1c-b84e265a9146",
      "b555afd5-9658-4b5c-a716-722d93176f67",
      "f105fd44-d508-47d6-b3cc-d576c1ea938b",
      "3a0864ea-fa6b-437d-a512-2a952d2f836e",
      "8355c8c2-75a3-4a09-aecd-1a7c7e2143b7",
      "1452b966-c98a-451d-b10e-7be342d75846",
      "29c89996-0dd2-4b7c-8eb7-dc12b1558ccd",
      "64edc496-1413-467d-a644-43fc70472e4f",
      "40208334-f3bd-488b-b746-507b604db00b",
      "6af56822-41ac-4c2a-92a8-13937af2b8fd",
      "b7b5e67a-df6e-4218-ac0d-24c1214dd31e",
      "acbaa761-3303-45fa-b776-6dd5aea82423",
      "83be178d-1614-4fce-9c66-3404625c04ee",
      "264acacd-1d67-42d3-8c11-751edb392a97",
      "3f51ccc8-156b-4b1b-bdcf-3eb2c7f49e90",
      "bc269522-878c-464b-974c-b286e23abd2b",
      "de5f2d9b-ffce-4334-beeb-18f50196e9fc",
      "6170616e-a4e5-4e17-a1ba-a40b6e2aff63",
      "cdd0a035-2ce2-442b-8540-7761d1a5d188",
      "4c71930d-0317-4791-bc09-3e1d5d3fbbed",
      "f4ed3d10-573f-44ff-aee1-a6fe9a962968",
      "c33ff50c-6fb2-459d-b012-c4a730639d85",
      "96eec6d3-0d0b-4d1c-b0e1-ee9afbdb41a6",
      "58d933a8-8d91-4fe4-9aef-0ceb5ecba5a8",
      "c2e4c23b-39a3-42e8-b587-7f4a211a686a",
      "d7004e4e-247c-4ca6-b23c-532a379a137a",
      "b7949b1b-3d72-47b2-80cb-a4987887928f",
      "04de94a3-c6df-416f-939b-3e285df9feb1",
      "42a547ca-e152-40dc-9e8d-dec1f4524397",
      "a610eb9d-dab8-4144-aa7e-29f0172b486d",
      "4e82886a-f6fd-4c8f-bfce-93148c3b5e42",
      "fcbf19b9-0fd5-4d94-b46a-2263c4dfbdd1",
      "02ac3781-5b22-4c44-a13b-70e4516dbced",
      "7b0853f7-dff3-420a-8713-aea274673278",
      "969e6931-845b-4d8c-9560-86c25b5cd943",
      "c143a737-174f-4af7-8904-b21253ced2ca",
      "b3165eb2-c286-4f37-a3ea-723a7b1833db",
      "ece29d6d-54bf-462e-ab19-5950722c2e1f",
      "e679ec29-3e30-4fa0-bb93-6bf0f3d1182d",
      "34290602-13c4-42e7-a87e-5ece0cb524fe",
      "3b318d2a-6075-4cd7-ad3e-62ee4871910b",
      "307dc085-1e58-43d7-bb87-5ffcaeed9bb8",
      "190bf74b-1220-4641-a357-3d05fd2cf8fc",
      "0e1bcea1-30d7-48a4-b26c-8a9b6a159cb1",
      "e99b827a-e7f6-4f70-b992-a6a99dd671c1",
      "f51b4b65-3a69-4b6a-ba37-f7bb6d0049fb",
      "01a7908c-d1e1-488e-ba0a-572b6d7080b0",
      "10087242-ef76-4110-b5e8-b746eb7df2a2",
      "d3f11d1e-93f8-498e-87ac-974a447675ee",
      "96351d6a-a0ea-44d4-aa2c-e107a33afa9b",
      "823790d5-1ff9-46ff-8491-9d7a46186a3c",
      "b8372617-8f1a-4e56-a844-9e9abd0147c8",
      "9f458b5c-7041-432b-a45e-af336ce8cc60",
      "59666986-a7ac-4186-94e7-58181ee77569",
      "a225fe11-3515-493d-a313-378a4ef545ad",
      "d0676271-ce8b-46c2-91a9-ef607e316438",
      "5737556f-a188-417c-b586-87f9c35fb2e4",
      "4b696a78-c8f5-4817-9db7-101c6f2b5d8a",
      "1b30288e-c3d5-4509-9165-4772bce22229",
      "cec12879-6a06-4c19-99e5-63612d2455f5",
      "60e96c77-d907-4b3f-bfc8-adce8a4b930b",
      "f76c0824-0c7b-4e0d-84c9-146bfc43b0a6",
      "6a15f616-342a-4114-bcee-d3011fd7d58d",
      "7fd14e6a-b617-46e6-98c4-e848dbb9a1a4",
      "499ff3f2-e593-49a1-baba-ad2477d84d7e",
      "7a806c1d-7889-411c-9e2c-126a160b7a6e",
      "b06a7e19-8f45-490c-802d-9bd5e6123f77",
      "aa0d08f9-869b-409c-969e-c12a2ba49d9f",
      "56221a0e-3d8c-4c42-9d58-dbc1c75e5135",
      "66649d43-1fab-473d-9093-ca147235a785",
      "81e433ed-21ad-4e65-b47e-4c152fa1322a",
      "beaa7742-1e8b-47fb-ba84-d8319919973b",
      "4eb33ef3-e50a-4aef-8d39-a00294491f95",
      "95402651-80f8-4ab0-8d19-bd884d984356",
      "a8fcfb3e-9c0d-4f90-b1d3-95f747bfda1d",
      "f6ae73e2-c1e0-4186-8bfd-865415f664e3",
      "7ff9a3f7-0fcc-43fe-801e-00184b929696",
      "ff9153a8-83f4-44e8-8e13-d81c165d7bb7",
      "f23915f3-c14c-4114-9230-53971bcf0277",
      "3ba9051f-3a08-4f41-9258-b53c706dfcf9",
      "4920e517-c992-4e30-987d-565851e258f4",
      "9eecaa8b-b567-441e-a611-306e6779fd41",
      "70ea46d5-be3d-4a17-8ce2-a94e89918183",
      "e0fb452e-218d-4bb3-be59-6d1005cc65ee",
      "053dde91-2bce-439a-96d7-10ba2730739e",
      "f09d9778-2968-4050-8731-0d972eb18d37",
      "77557707-2d29-4d6f-9e75-be86acbca8ba",
      "afa8484d-754e-49eb-8718-c28c266e7fd3",
      "01e998ba-78f2-4b4b-b625-e33e6c08dc70",
      "2b216e70-5a3e-4efe-97df-71742eb12a57",
      "f2654fe5-7ad8-46a4-b8fd-2db56f97cb9e",
      "3105605b-cab5-4604-9ae0-2da379dd74f1",
      "cc117a23-c5eb-4b96-a097-dc06bc7a7262",
      "d137f415-daeb-42ed-9e45-3dd696c3a7a5",
      "cd521e86-8abb-49fd-9b38-6187d0913610",
      "2f9eccff-b488-43df-9785-66bf66d65b6f",
      "96972373-c9a2-418c-909e-867af1ec4960",
      "9dec21b2-8067-42de-96c8-213f926f7cf0",
      "090e7f08-a4ec-450c-af7f-39a227a13e9f",
      "9e42d3e5-af3c-4c88-802e-f5d15e5e1859",
      "ba69e2cb-f70e-47fc-9e60-d4b9449c5b83",
      "728c108e-4fe4-462e-b436-348b8014a863",
      "952826cc-96b4-4064-aec9-529a3efc42d2",
      "b4649eec-1e0e-49c0-a543-db04c698992e",
      "15f442a7-595a-492d-95c0-c16ad39ca1b7",
      "61dca393-63e2-4472-a58f-95f39e3f8653",
      "c779b0e7-59be-441b-953b-92696ed67c24",
      "21a15548-415f-4875-a461-198dbba05033",
      "2bcb2c50-23b6-4f3b-a307-ed4199ed0ccb",
      "d71b406a-e492-4826-9159-273797c07da3",
      "3baf9950-8863-48f1-8d4b-42119513c57d",
      "6c4cc85a-df5c-4f27-932a-0fb133452c33",
      "4dce5da9-e734-4746-8dda-d18b067c83f7",
      "35b6b7df-f293-4916-aad1-3bc0c633984c",
      "efdde8fa-817b-4e06-bd03-c83a228894e8",
      "7c9d7273-1204-4345-a17b-e6ffcc29a2f1",
      "3e715dec-26a1-4fed-84e2-5c1df924b13d",
      "964276c5-f9dc-4e64-8084-6e2b32f97581",
      "780bed7d-a177-4c82-89d9-79ff2defa147",
      "742415f1-9193-463d-ac4f-e7a0a37e96d4",
      "a247a5b8-b13a-49b9-a803-20a6efe3ccec",
      "ed267d36-4fcf-46d0-a543-1b8bee2fffbe",
      "ab669344-206f-42bf-a697-8e045c9e8fe0",
      "fe519f75-3e79-4f5a-9cbf-67691abff1cd",
      "4d89fef5-535e-4b58-95bc-ef860df8bb72",
      "b589ce56-e338-4368-8b65-ed7ab276da5a",
      "9e3af95c-ac36-448f-88ef-b2f3617fa3e5",
      "be6cbb96-6153-4104-8af6-a389a0853fa7",
      "a4159895-5f0c-4c5b-8ec4-bec319d30aa4",
      "02cb4424-6679-4bed-a52e-1545f41db68c",
      "e63a98c1-2b0f-4a02-aad2-b604544829e0",
      "05b14866-4782-4c4b-b26d-6cde4b4f5cf8",
      "f5ce27dd-7759-429c-863a-70a990f4f1d3",
      "8af84c7c-173a-49a2-bb7b-f2df30db94e8",
      "ff50b645-9daf-4d48-af30-5e89390b1bd2",
      "e6bed0d8-ae97-4c57-8f89-45bfdc604b1b",
      "e3a8e1ce-5107-4d8e-9671-d133c178c67d",
      "05dac552-8f05-4b05-b270-01cc43f51b9e",
      "6b2e94a5-0b10-41a3-b453-00f6ab1449ca",
      "d0d02386-e123-4899-90fe-93969b3f1abd",
      "f52db6b8-b4af-44fd-9a20-eff616500088",
      "571eb82a-b558-4003-baab-af784235128a",
      "02d72d5d-5713-4a6f-b717-488fbc7deaf1"
    ];

    const now = new Date();
    const records = [];
    let idCounter = 0;

    // Generar las franjas para cada doctor
    doctorIds.forEach(doctorId => {
      // la duracion es 20 min de slot 
      let slotDuration = 20;
      //para dermatologia 10 min
      if (dermatologyDoctors.includes(doctorId)) slotDuration = 10;
      //para cardiologia 30 min
      else if (cardiologyDoctors.includes(doctorId)) slotDuration = 30;

      // Lunes–Viernes: 12–14 y 15–18
      for (let weekday = 1; weekday <= 5; weekday++) {
        records.push({
          id: fixedIds[idCounter++],
          doctor_id: doctorId,
          weekday,
          start_time: '12:00:00',
          end_time:   '14:00:00',
          slot_duration_min: slotDuration,
          createdAt: now,
          updatedAt: now
        });
        records.push({
          id: fixedIds[idCounter++],
          doctor_id: doctorId,
          weekday,
          start_time: '15:00:00',
          end_time:   '18:00:00',
          slot_duration_min: slotDuration,
          createdAt: now,
          updatedAt: now
        });
      }

      // Sábado: 12–15
      records.push({
        id: fixedIds[idCounter++],
        doctor_id: doctorId,
        weekday: 6,
        start_time: '12:00:00',
        end_time:   '15:00:00',
        slot_duration_min: slotDuration,
        createdAt: now,
        updatedAt: now
      });
    });

    //Inserta todos los registros
    await queryInterface.bulkInsert('DoctorAvailabilities', records, {});
    console.log(`→ Insertadas ${records.length} disponibilidades`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('DoctorAvailabilities', null, {});
  }
};