from sqlalchemy.orm import Session
from uuid import uuid4

from ..models.institute import Institute
from ..schemas.institute import InstituteCreate, InstituteInDB

def create_institute(db: Session, institute: InstituteCreate) -> InstituteInDB:
    db_institute = Institute(
        id=uuid4(),
        name=institute.name,
        district=institute.district,
        block=institute.block
    )
    db.add(db_institute)
    db.commit()
    db.refresh(db_institute)
    return InstituteInDB.from_orm(db_institute)

def get_institutes(db: Session) -> list[InstituteInDB]:
    institutes = db.query(Institute).all()
    return [InstituteInDB.from_orm(institute) for institute in institutes] 