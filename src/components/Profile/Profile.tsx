import { NextPage } from "next";
import { useToggleNavbar } from "@context/Navigation.context";

const Profile: NextPage = () => {
	const { closeNavigation } = useToggleNavbar();

	return (
		<>
			<div onClick={closeNavigation} id="main__container">
				<section id="profile" className="container">
					<div className="profile__himti text-center">
						<p className="fs-title">Apa itu HIMTI UIN Jakarta?</p>
						<p className="fs-text">
							<span className="fs-title">HIMTI UIN Syarif Hidayatullah Jakarta</span>
							merupakan wadah silaturahmi dan pemersatu antar Mahasiswa dengan Alumni Program Studi Teknik Informatika UIN Syarif Hidayatullah Jakarta, serta berfungsi sebagai penyelenggara
							kegiatan untuk kemahasiswaan, penalaran, dan keilmuan di bidang teknologi informasi.
						</p>
					</div>

					<div className="profile__vision mt-4 mt-md-5">
						<p className="fs-title text-center">Visi</p>
						<div className="row row-cols-1 row-cols-md-2 gx-5 mt-4 mt-md-5">
							<div className="col text-center text-md-end">
								<p className="fs-text">
									Terwujudnya HIMTI UIN Jakarta yang dinamis dan aktif dalam fungsi internal dan eksternal dengan berlandaskan semangat solidaritas dan profesionalitas dalam menuju himpunan
									yang harmoni.
								</p>
							</div>
							<div className="col text-center text-md-start">
								<p className="fs-text">Meningkatkan peran proaktif Mahasiswa TI dalam aktivitas organisasi, profesi, maupun minat dan bakat.</p>
								<p className="fs-text">Menjadikan HIMTI UIN Jakarta sebagai wadah sekunder bagi Mahasiswa TI dalam mengembangkan kemampuan akademis maupun non-akademis.</p>
								<p className="fs-text">Mempererat hubungan persaudaraan antar Mahasiswa TI melalui semangat solidaritas dan profesionalitas</p>
							</div>
						</div>
					</div>
				</section>

				<section id="mars-himti" className="container">
					<div className="border-top__content thick text-center pt-4 pt-md-5">
						<p className="fs-title">Mars HIMTI</p>

						<div className="row row-cols-1 row-cols-md-2 justify-content-between gx-5 mt-4 mt-md-5">
							<iframe className="mars-himti__video" src="https://www.youtube.com/embed/tgbNymZ7vqY" frameBorder="0"></iframe>
							<div className="mars-himti__lyric fs-text">
								<p>Dummy lirik</p>
								<p>Meningkatkan peran proaktif Mahasiswa TI dalam aktivitas organisasi, profesi, maupun minat dan bakat.</p>
								<p>Menjadikan HIMTI UIN Jakarta sebagai wadah sekunder bagi Mahasiswa TI dalam mengembangkan kemampuan akademis maupun non-akademis.</p>
								<p>Mempererat hubungan persaudaraan antar Mahasiswa TI melalui semangat solidaritas dan profesionalitas</p>
							</div>
						</div>
					</div>
				</section>

				<section id="structure-organizaion" className="container">
					<div className="border-top__content thick text-center pt-4 pt-md-5">
						<p className="fs-title">Struktur Organisasi</p>
						<img className="img-fluid w-100 mt-4 mt-md-5" src="../../assets/thumbs/thumb-structure-organization.png" alt="structure organization himti uin jakarta" />
						<img className="img-fluid w-100 mt-4 mt-md-5" src="../../assets/thumbs/thumb-structure-organization2.png" alt="structure organization himti uin jakarta" />
					</div>
				</section>
			</div>
		</>
	);
};

export default Profile;
